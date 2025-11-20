import crypto from "crypto"
import { logger } from "@/utils/logger"
import { KycRepository } from "@/repositories/kyc.repository"
import { UserRepository } from "@/repositories/user.repository"
import { generateToken, generateRefreshToken } from "@/utils/jwt"
import { createError } from "@/middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { NotificationService } from "@/services/shared/notification.service"

export interface RegisterUserDto {
  name: string
  email: string
  password: string
  phone: string
}

export interface LoginDto {
  email: string
  password: string
}

export class AuthService {
  private userRepo: UserRepository
  private kycRepo: KycRepository
  private notificationService: NotificationService

  constructor() {
    this.userRepo = new UserRepository()
    this.kycRepo = new KycRepository()
    this.notificationService = new NotificationService()
  }

  async register(data: RegisterUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepo.findByEmail(data.email)
      if (existingUser) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_ALREADY_EXISTS], 409, ERROR_CODES.USER_ALREADY_EXISTS)
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex")
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user
      const user = await this.userRepo.create({
        ...data,
        emailVerificationToken,
        emailVerificationExpires,
      } as any)

      const userId = (user._id as string).toString();

      await this.notificationService.send({
        userId,
        type: "general",
        title: "Verify Your Email",
        message: `Please verify your email by clicking the link: ${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType: "welcome",
        templateData: {
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`,
        },
        metadata: {
          verificationToken: emailVerificationToken,
        },
      })

      logger.info(`User registered: ${user.email}`)

      return {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
        },
        message: "Registration successful. Please check your email to verify your account.",
      }
    } catch (error) {
      logger.error("Registration error:", error)
      throw error
    }
  }

  async login(data: LoginDto) {
    try {
      // Find user by email
      const user = await this.userRepo.findByEmail(data.email)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS], 401, ERROR_CODES.INVALID_CREDENTIALS)
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError("Account is deactivated", 403, ERROR_CODES.FORBIDDEN)
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(data.password)
      if (!isPasswordValid) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS], 401, ERROR_CODES.INVALID_CREDENTIALS)
      }

      const userId = (user._id as string).toString();

      // Update last login
      await this.userRepo.update( userId, { lastLogin: new Date() } as any );

      const currentKyc = await this.kycRepo.getCurrentKyc(userId)

      // Generate tokens
      const token = generateToken({
        userId,
        role: user.role,
        email: user.email,
      })

      const refreshToken = generateRefreshToken({
        userId,
        role: user.role,
        email: user.email,
      })

      logger.info(`User logged in: ${user.email}`)

      return {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          kycStatus: currentKyc?.status || "not_submitted",
          kycLevel: currentKyc?.level,
        },
        token,
        refreshToken,
      }
    } catch (error) {
      logger.error("Login error:", error)
      throw error
    }
  }

  async verifyEmail(token: string) {
    try {
      const user = await this.userRepo.findByEmailVerificationToken(token)
      if (!user) {
        throw createError("Invalid or expired verification token", 400, ERROR_CODES.INVALID_TOKEN)
      }

      // Update user
      await this.userRepo.update((user._id as string).toString(), {
        emailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined,
      } as any)

      logger.info(`Email verified: ${user.email}`)

      return {
        message: "Email verified successfully",
      }
    } catch (error) {
      logger.error("Email verification error:", error)
      throw error
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.userRepo.findByEmail(email)
      if (!user) {
        // Don't reveal if user exists
        return {
          message: "If an account exists with this email, a password reset link has been sent.",
        }
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      const userId = (user._id as string).toString();

      await this.userRepo.update(userId, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      } as any)

      await this.notificationService.send({
        userId,
        type: "general",
        title: "Password Reset Request",
        message: `Reset your password by clicking: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType: "password-reset",
        templateData: {
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        },
        metadata: {
          resetToken,
        },
      })

      logger.info(`Password reset requested: ${user.email}`)

      return {
        message: "If an account exists with this email, a password reset link has been sent.",
      }
    } catch (error) {
      logger.error("Password reset request error:", error)
      throw error
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await this.userRepo.findByResetPasswordToken(token)
      if (!user) {
        throw createError("Invalid or expired reset token", 400, ERROR_CODES.INVALID_TOKEN)
      }

      const userId = (user._id as string).toString();;

      // Update password
      user.password = newPassword
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()

      const timestamp = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "long",
      })

      await this.notificationService.send({
        userId,
        type: "general",
        title: "Password Changed Successfully",
        message: `Your password was successfully changed on ${timestamp}. If you didn't make this change, please contact support immediately.`,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType: "password-changed",
        templateData: {
          timestamp,
          supportEmail: process.env.ADMIN_EMAIL || "support@spedxpay.com",
        },
        metadata: {
          changedAt: new Date().toISOString(),
        },
      })

      logger.info(`Password reset: ${user.email}`)

      return {
        message: "Password reset successfully",
      }
    } catch (error) {
      logger.error("Password reset error:", error)
      throw error
    }
  }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
      try {
      // Find user with password field
        const user = await this.userRepo.findById( userId, "+password" )
        
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword)
      if (!isPasswordValid) {
        throw createError("Current password is incorrect", 401, ERROR_CODES.INVALID_CREDENTIALS)
      }

      // Update password
      user.password = newPassword
      await user.save()

      const timestamp = new Date().toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "long",
      })

      await this.notificationService.send({
        userId,
        type: "general",
        title: "Password Changed Successfully",
        message: `Your password was successfully changed on ${timestamp}. If you didn't make this change, please contact support immediately.`,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType: "password-changed",
        templateData: {
          timestamp,
          supportEmail: process.env.ADMIN_EMAIL || "support@spedxpay.com",
        },
        metadata: {
          changedAt: new Date().toISOString(),
        },
      })

      logger.info(`Password changed: ${user.email}`)

      return {
        message: "Password changed successfully",
      }
    } catch (error) {
      logger.error("Change password error:", error)
      throw error
    }
  }
}
