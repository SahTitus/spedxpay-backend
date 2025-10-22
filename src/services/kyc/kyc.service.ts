import { KycRepository } from "@/repositories/kyc.repository"
import { UserRepository } from "@/repositories/user.repository"
import { NotificationService } from "@/services/shared/notification.service"
import { createError } from "@/middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { KYC_STATUS, KYC_LEVEL } from "@/constants/statuses"
import { logger } from "@/utils/logger"
import { v4 as uuidv4 } from "uuid"

export interface SubmitKycDto {
  level?: string
  idDocument: string
  selfieDocument: string
  proofOfAddress?: string
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
}

export class KycService {
  private kycRepo: KycRepository
  private userRepo: UserRepository
  private notificationService: NotificationService

  constructor() {
    this.kycRepo = new KycRepository()
    this.userRepo = new UserRepository()
    this.notificationService = new NotificationService()
  }

  async submitKyc(userId: string, data: SubmitKycDto) {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
    }

    // Check if user has an approved KYC
    const approvedKyc = await this.kycRepo.findApprovedByUserId(userId)
    if (approvedKyc) {
      throw createError("You already have an approved KYC", 400, ERROR_CODES.KYC_ALREADY_APPROVED)
    }

    // Get previous submissions to calculate version
    const previousSubmissions = await this.kycRepo.findByUserId(userId)
    const version = previousSubmissions.length + 1

    // Create new KYC submission
    const submissionId = uuidv4()
    const kycSubmission = await this.kycRepo.create({
      userId,
      submissionId,
      level: data.level || KYC_LEVEL.BASIC,
      status: KYC_STATUS.PENDING,
      documents: {
        idDocument: data.idDocument,
        selfieDocument: data.selfieDocument,
        proofOfAddress: data.proofOfAddress,
      },
      version,
      metadata: data.metadata,
      submittedAt: new Date(),
    } as any)

    // Notify admins
    await this.notificationService.send({
      userId: userId,
      type: "admin_alert",
      title: "New KYC Submission",
      message: `User ${user.name} (${user.email}) has submitted KYC documents for review.`,
      channels: ["email"],
      userEmail: process.env.ADMIN_EMAIL || "admin@spedxpay.com",
      userName: "Admin",
      templateType: "admin-kyc-submission",
      templateData: {
        userName: user.name,
        userEmail: user.email,
        userId,
        submissionId,
        level: data.level || KYC_LEVEL.BASIC,
        version,
        reviewLink: `${process.env.FRONTEND_URL}/admin/kyc/${submissionId}`,
      },
      metadata: {
        userId,
        submissionId,
        userName: user.name,
        userEmail: user.email,
      },
    })

    logger.info(`KYC submitted: ${user.email} - Submission ID: ${submissionId}`)

    return {
      submissionId,
      status: kycSubmission.status,
      message: "KYC documents submitted successfully. Please wait for admin review.",
    }
  }

  async getKycStatus(userId: string) {
    const latestKyc = await this.kycRepo.findLatestByUserId(userId)

    if (!latestKyc) {
      return {
        hasKyc: false,
        status: null,
        message: "No KYC submission found. Please submit your documents.",
      }
    }

    return {
      hasKyc: true,
      submissionId: latestKyc.submissionId,
      status: latestKyc.status,
      level: latestKyc.level,
      submittedAt: latestKyc.submittedAt,
      reviewedAt: latestKyc.reviewedAt,
      rejectionReason: latestKyc.rejectionReason,
      expiresAt: latestKyc.expiresAt,
      version: latestKyc.version,
    }
  }

  async getKycHistory(userId: string) {
    const submissions = await this.kycRepo.getSubmissionHistory(userId)

    return submissions.map((kyc) => ({
      submissionId: kyc.submissionId,
      status: kyc.status,
      level: kyc.level,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      rejectionReason: kyc.rejectionReason,
      version: kyc.version,
    }))
  }

  async getKycDetails(userId: string, submissionId: string) {
    const kyc = await this.kycRepo.findBySubmissionId(submissionId)

    if (!kyc) {
      throw createError("KYC submission not found", 404, ERROR_CODES.KYC_NOT_FOUND)
    }

    if (kyc.userId.toString() !== userId) {
      throw createError("Unauthorized access to KYC submission", 403, ERROR_CODES.UNAUTHORIZED)
    }

    return {
      submissionId: kyc.submissionId,
      status: kyc.status,
      level: kyc.level,
      documents: kyc.documents,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      rejectionReason: kyc.rejectionReason,
      expiresAt: kyc.expiresAt,
      version: kyc.version,
    }
  }

  async isKycApproved(userId: string): Promise<boolean> {
    const approvedKyc = await this.kycRepo.findApprovedByUserId(userId)
    return !!approvedKyc
  }
}
