import { KycRepository } from "../../repositories/kyc.repository.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { NotificationService } from "../../services/shared/notification.service.js";
import { createError } from "../../middlewares/common/error.middleware.js";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes.js";
import { KYC_STATUS } from "../../constants/statuses.js";
import { logger } from "../../utils/logger.js";

export interface ReviewKycDto {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

export class AdminKycService {
  private kycRepo: KycRepository;
  private userRepo: UserRepository;
  private notificationService: NotificationService;

  constructor() {
    this.kycRepo = new KycRepository();
    this.userRepo = new UserRepository();
    this.notificationService = new NotificationService();
  }

  async getPendingKyc() {
    const submissions = await this.kycRepo.findPendingSubmissions();

    return submissions.map((kyc: any) => ({
      submissionId: kyc.submissionId,
      userId: kyc.userId._id,
      userName: kyc.userId.name,
      userEmail: kyc.userId.email,
      userPhone: kyc.userId.phone,
      level: kyc.level,
      status: kyc.status,
      documents: kyc.documents,
      submittedAt: kyc.submittedAt,
      version: kyc.version,
    }));
  }

  async getKycDetails(submissionId: string) {
    const kyc = await this.kycRepo.findBySubmissionId(submissionId);

    if (!kyc) {
      throw createError(
        "KYC submission not found",
        404,
        ERROR_CODES.KYC_NOT_FOUND
      );
    }

    await kyc.populate("userId", "name email phone");
    await kyc.populate("reviewedBy", "name email");

    return {
      submissionId: kyc.submissionId,
      user: kyc.userId,
      level: kyc.level,
      status: kyc.status,
      documents: kyc.documents,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      reviewedBy: kyc.reviewedBy,
      rejectionReason: kyc.rejectionReason,
      version: kyc.version,
      metadata: kyc.metadata,
    };
  }

  async reviewKyc(adminId: string, submissionId: string, data: ReviewKycDto) {
    try {
      const kyc = await this.kycRepo.findBySubmissionId(submissionId);
      if (!kyc) {
        throw createError(
          "KYC submission not found",
          404,
          ERROR_CODES.KYC_NOT_FOUND
        );
      }

      if (
        ![KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW].includes(
          kyc.status as any
        )
      ) {
        throw createError(
          "KYC is not in pending or under review status",
          400,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Update KYC status
      const updatedKyc = await this.kycRepo.updateStatus(
        submissionId,
        data.status,
        adminId,
        data.rejectionReason
      );

      if (!updatedKyc) {
        throw createError(
          "Failed to update KYC status",
          500,
          ERROR_CODES.INTERNAL_SERVER_ERROR
        );
      }

      // Get user details
      const user = await this.userRepo.findById(kyc.userId.toString());
      if (!user) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
          404,
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      // Send notification to user
      const notificationType =
        data.status === "approved" ? "kyc_approved" : "kyc_rejected";
      const templateType =
        data.status === "approved" ? "kyc-approved" : "kyc-rejected";
      const message =
        data.status === "approved"
          ? "Your KYC has been approved. You can now perform transactions."
          : `Your KYC has been rejected. Reason: ${data.rejectionReason}`;

      await this.notificationService.send({
        userId: kyc.userId.toString(),
        type: notificationType,
        title: data.status === "approved" ? "KYC Approved" : "KYC Rejected",
        message,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType,
        templateData: {
          status: data.status,
          submissionId,
          level: kyc.level,
          rejectionReason: data.rejectionReason,
          reviewedAt: updatedKyc.reviewedAt,
        },
      });

      logger.info(
        `KYC ${data.status} for submission ${submissionId} by admin ${adminId}`
      );

      return {
        message: `KYC ${data.status} successfully`,
        submissionId,
        status: updatedKyc.status,
      };
    } catch (error) {
      logger.error("Review KYC error:", error);
      throw error;
    }
  }

  async getKycStats() {
    const [pending, underReview, approved, rejected] = await Promise.all([
      this.kycRepo.countByStatus(KYC_STATUS.PENDING),
      this.kycRepo.countByStatus(KYC_STATUS.UNDER_REVIEW),
      this.kycRepo.countByStatus(KYC_STATUS.APPROVED),
      this.kycRepo.countByStatus(KYC_STATUS.REJECTED),
    ]);

    return {
      pending,
      underReview,
      approved,
      rejected,
      total: pending + underReview + approved + rejected,
    };
  }

  async getUserKycHistory(userId: string) {
    const submissions = await this.kycRepo.getSubmissionHistory(userId);

    return submissions.map((kyc: any) => ({
      submissionId: kyc.submissionId,
      status: kyc.status,
      level: kyc.level,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      reviewedBy: kyc.reviewedBy
        ? { name: kyc.reviewedBy.name, email: kyc.reviewedBy.email }
        : null,
      rejectionReason: kyc.rejectionReason,
      version: kyc.version,
    }));
  }

  async getAllSubmissions(
    page = 1,
    limit = 20,
    filters: { status?: string } = {},
    search?: string
  ) {
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      this.kycRepo.findAllWithPagination(skip, limit, filters, search),
      this.kycRepo.countWithFilters(filters, search),
    ]);

    return {
      submissions: submissions.map((kyc: any) => ({
        submissionId: kyc.submissionId,
        userId: kyc.userId._id,
        userName: kyc.userId.name,
        userEmail: kyc.userId.email,
        documents: kyc.documents,
        level: kyc.level,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
        reviewedAt: kyc.reviewedAt,
        version: kyc.version,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
