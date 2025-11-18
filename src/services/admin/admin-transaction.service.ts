import { TransactionRepository } from "@/repositories/transaction.repository"
import { UserRepository } from "@/repositories/user.repository"
import { NotificationService } from "@/services/shared/notification.service"
import { createError } from "@/middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { TRANSACTION_STATUS } from "@/constants/statuses"
import { logger } from "@/utils/logger"

export interface ConfirmPaymentDto {
  blockchainTxHash?: string
  adminNotes?: string
}

export interface CompleteTransactionDto {
  adminNotes?: string
}

export interface RejectTransactionDto {
  reason: string
}

export class AdminTransactionService {
  private transactionRepo: TransactionRepository
  private userRepo: UserRepository
  private notificationService: NotificationService

  constructor() {
    this.transactionRepo = new TransactionRepository()
    this.userRepo = new UserRepository()
    this.notificationService = new NotificationService()
  }

  async getPendingTransactions() {
    return this.transactionRepo.findPendingTransactions()
  }

  async getTransaction(transactionId: string) {
    const transaction = await this.transactionRepo.findById(transactionId)
    if (!transaction) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
    }
    return transaction
  }

  async confirmPayment(adminId: string, transactionId: string, data: ConfirmPaymentDto) {
    try {
      const transaction = await this.transactionRepo.findById(transactionId)
      if (!transaction) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      if (transaction.status !== TRANSACTION_STATUS.UNDER_REVIEW) {
        throw createError("Transaction is not under review", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Update transaction
      await this.transactionRepo.updateStatus(transactionId, TRANSACTION_STATUS.PAYMENT_CONFIRMED, {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        blockchainTxHash: data.blockchainTxHash,
        adminNotes: data.adminNotes,
      })

      // Notify user
      await this.notificationService.send({
        userId: transaction.userId.toString(),
        type: "payment_received",
        title: "Payment Confirmed",
        message: `Your payment for transaction ${transaction.txRef} has been confirmed by admin.`,
        channels: ["email"],
        metadata: {
          transactionId: transaction._id,
          txRef: transaction.txRef,
        },
      })

      logger.info(`Payment confirmed for transaction ${transaction.txRef} by admin ${adminId}`)

      return {
        message: "Payment confirmed successfully",
      }
    } catch (error) {
      logger.error("Confirm payment error:", error)
      throw error
    }
  }

  async completeTransaction(adminId: string, transactionId: string, data: CompleteTransactionDto) {
    try {
      const transaction = await this.transactionRepo.findById(transactionId)
      if (!transaction) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      // Update transaction
      await this.transactionRepo.updateStatus(transactionId, TRANSACTION_STATUS.COMPLETED, {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        completedAt: new Date(),
        adminNotes: data.adminNotes,
      })

      // Notify user
      await this.notificationService.send({
        userId: transaction.userId.toString(),
        type: "transaction_completed",
        title: "Transaction Completed",
        message: `Your transaction ${transaction.txRef} has been completed successfully.`,
        channels: ["email"],
        metadata: {
          transactionId: transaction._id,
          txRef: transaction.txRef,
        },
      })

      logger.info(`Transaction completed: ${transaction.txRef} by admin ${adminId}`)

      return {
        message: "Transaction completed successfully",
      }
    } catch (error) {
      logger.error("Complete transaction error:", error)
      throw error
    }
  }

  async rejectTransaction(adminId: string, transactionId: string, data: RejectTransactionDto) {
    try {
      const transaction = await this.transactionRepo.findById(transactionId)
      if (!transaction) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      // Update transaction
      await this.transactionRepo.updateStatus(transactionId, TRANSACTION_STATUS.REJECTED, {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: data.reason,
      })

      // Notify user
      await this.notificationService.send({
        userId: transaction.userId.toString(),
        type: "transaction_rejected",
        title: "Transaction Rejected",
        message: `Your transaction ${transaction.txRef} has been rejected. Reason: ${data.reason}`,
        channels: ["email"],
        metadata: {
          transactionId: transaction._id,
          txRef: transaction.txRef,
          reason: data.reason,
        },
      })

      logger.info(`Transaction rejected: ${transaction.txRef} by admin ${adminId}`)

      return {
        message: "Transaction rejected successfully",
      }
    } catch (error) {
      logger.error("Reject transaction error:", error)
      throw error
    }
  }

  async getAllTransactions(page = 1, limit = 20, filters: any = {}, search?: string) {
    const skip = (page - 1) * limit
    const [transactions, total] = await Promise.all([
      this.transactionRepo.findAllWithFilters(skip, limit, filters, search),
      this.transactionRepo.countWithFilters(filters, search),
    ] )

    return {
      transactions: transactions.map((tx: any) => ({
        transactionId: tx._id,
        txRef: tx.txRef,
        userId: tx.userId._id,
        userName: tx.userId.name,
        userEmail: tx.userId.email,
        userPhone: tx.userId.phone,
        type: tx.type,
        status: tx.status,
        cryptocurrency: tx.cryptocurrency,
        fiatCurrency: tx.fiatCurrency,
        amountCrypto: tx.amountCrypto,
        amountFiat: tx.amountFiat,
        rateUsed: tx.rateUsed,
        walletAddress: tx.walletAddress,
        platformWalletAddress: tx.platformWalletAddress,
        blockchainTxHash: tx.blockchainTxHash,
        paymentMethod: tx.paymentMethod,
        proofOfPayment: tx.proofOfPayment,
        proofOfSend: tx.proofOfSend,
        reviewedBy: tx.reviewedBy ? { name: tx.reviewedBy.name, email: tx.reviewedBy.email } : null,
        reviewedAt: tx.reviewedAt,
        completedAt: tx.completedAt,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
