import type { Response, NextFunction } from "express"
import type { AuthRequest } from "@/middlewares/auth/auth.middleware"
import { AuthService } from "@/services/auth/auth.service"
import { successResponse } from "@/utils/response-formatter"
import { asyncHandler } from "@/middlewares/common/error.middleware"

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = await this.authService.register(req.body)
    res.status(201).json(successResponse("User registered successfully", result))
  })

  login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const result = await this.authService.login(req.body)
    res.status(200).json(successResponse("Login successful", result))
  })

  verifyEmail = asyncHandler( async ( req: AuthRequest, res: Response, next: NextFunction ) => {
    const { token } = req.body
    const result = await this.authService.verifyEmail(token)
    res.status(200).json(successResponse("Email verified successfully", result))
  })

  requestPasswordReset = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email } = req.body
    const result = await this.authService.requestPasswordReset(email)
    res.status(200).json(successResponse("Password reset email sent", result))
  })

  resetPassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { token, password } = req.body
    const result = await this.authService.resetPassword(token, password)
    res.status(200).json(successResponse("Password reset successfully", result))
  })

  getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.status(200).json(
      successResponse("User profile retrieved", {
        user: req.user,
      }),
    )
  } )
  
    changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    if (!userId) {
      throw new Error("User not authenticated")
    }
    const { currentPassword, newPassword } = req.body
    const result = await this.authService.changePassword(userId, currentPassword, newPassword)
    res.status(200).json(successResponse("Password changed successfully", result))
  })
}
