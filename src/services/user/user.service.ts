import { UserRepository } from "../../repositories/user.repository.js";
import { createError } from "../../middlewares/common/error.middleware.js";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes.js";
import { logger } from "../../utils/logger.js";
import { KycRepository } from "../../repositories/kyc.repository.js";

export interface AddPaymentMethodDto {
  type: "momo" | "bank";
  details: {
    momoNumber?: string;
    momoProvider?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  isPrimary?: boolean;
}

export class UserService {
  private userRepo: UserRepository;
  private kycRepo: KycRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.kycRepo = new KycRepository();
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Get latest KYC details
    const latestKyc = await this.kycRepo.findLatestByUserId(userId);

    let kycInfo;
    if (!latestKyc) {
      kycInfo = {
        hasKyc: false,
        status: null,
        message: "No KYC submission found. Please submit your documents.",
      };
    } else {
      kycInfo = {
        hasKyc: true,
        submissionId: latestKyc.submissionId,
        status: latestKyc.status,
        level: latestKyc.level,
        submittedAt: latestKyc.submittedAt,
        reviewedAt: latestKyc.reviewedAt,
        rejectionReason: latestKyc.rejectionReason,
        expiresAt: latestKyc.expiresAt,
        version: latestKyc.version,
      };
    }

    // Return merged profile
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kyc: kycInfo,
      emailVerified: user.emailVerified,
      paymentMethods: user.paymentMethods,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    updates: { name?: string; phone?: string }
  ) {
    const user = await this.userRepo.update(userId, updates as any);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    logger.info(`Profile updated: ${user.email}`);

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }

  async addPaymentMethod(userId: string, data: AddPaymentMethodDto) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // If this is set as primary, unset other primary methods
    if (data.isPrimary) {
      for (let i = 0; i < user.paymentMethods.length; i++) {
        if (user.paymentMethods[i].isPrimary) {
          await this.userRepo.updatePaymentMethod(userId, i, {
            isPrimary: false,
          });
        }
      }
    }

    await this.userRepo.addPaymentMethod(userId, {
      type: data.type,
      details: data.details,
      verified: true,
      isPrimary: data.isPrimary || false,
    });

    logger.info(`Payment method added: ${user.email}`);

    return {
      message: "Payment method added successfully",
    };
  }

  async verifyPaymentMethod(userId: string, methodIndex: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    if (!user.paymentMethods[methodIndex]) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_NOT_FOUND],
        404,
        ERROR_CODES.PAYMENT_METHOD_NOT_FOUND
      );
    }

    await this.userRepo.updatePaymentMethod(userId, methodIndex, {
      verified: true,
    });

    logger.info(`Payment method verified: ${user.email}`);

    return {
      message: "Payment method verified successfully",
    };
  }

  async setPrimaryPaymentMethod(userId: string, methodIndex: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    if (!user.paymentMethods[methodIndex]) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_NOT_FOUND],
        404,
        ERROR_CODES.PAYMENT_METHOD_NOT_FOUND
      );
    }

    // Unset all primary flags
    for (let i = 0; i < user.paymentMethods.length; i++) {
      if (user.paymentMethods[i].isPrimary) {
        await this.userRepo.updatePaymentMethod(userId, i, {
          isPrimary: false,
        });
      }
    }

    // Set new primary
    await this.userRepo.updatePaymentMethod(userId, methodIndex, {
      isPrimary: true,
    });

    logger.info(`Primary payment method set: ${user.email}`);

    return {
      message: "Primary payment method updated successfully",
    };
  }

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND],
        404,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Check if payment method exists
    const paymentMethod = user.paymentMethods.find(
      (pm: any) => pm._id.toString() === paymentMethodId
    );
    if (!paymentMethod) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_NOT_FOUND],
        404,
        ERROR_CODES.PAYMENT_METHOD_NOT_FOUND
      );
    }

    // Remove the payment method
    await this.userRepo.removePaymentMethod(userId, paymentMethodId);

    logger.info(`Payment method removed: ${user.email}`);

    return {
      message: "Payment method removed successfully",
    };
  }
}
