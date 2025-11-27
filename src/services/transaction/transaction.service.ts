import { TransactionRepository } from "../../repositories/transaction.repository"
import { GiftCardRepository } from "../../repositories/gift-card.repository"
import { GoogleVoiceOrderRepository } from "../../repositories/google-voice-order.repository"
import { UserRepository } from "../../repositories/user.repository"
import { createError } from "../../middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes"
import { logger } from "../../utils/logger"
import { TRANSACTION_STATUS } from "../../constants/statuses"

export interface GetTransactionsQuery {
  type?: "crypto" | "giftcard" | "googlevoice" | "all"
  transactionType?: string
  status?: string
  search?: string
  cardType?: string
  page?: number
  limit?: number
  sort?: string
}

export class TransactionService {
  private transactionRepo: TransactionRepository
  private giftCardRepo: GiftCardRepository
  private googleVoiceRepo: GoogleVoiceOrderRepository
  private userRepo: UserRepository

  constructor() {
    this.transactionRepo = new TransactionRepository()
    this.giftCardRepo = new GiftCardRepository()
    this.googleVoiceRepo = new GoogleVoiceOrderRepository()
    this.userRepo = new UserRepository()
  }

  async getUserTransactions(userId: string, query: GetTransactionsQuery) {
    try {
      const {
        type = "all",
        transactionType,
        status,
        search,
        cardType,
        page = 1,
        limit = 20,
        sort = "createdAt:desc",
      } = query

      const result = await this.transactionRepo.findUserTransactionsWithPagination({
        userId,
        type, // Pass type as-is: 'crypto' | 'giftcard' | 'googlevoice' | 'all'
        transactionType, // Pass specific transaction type if provided
        status,
        search,
        cardType,
        page: Number(page),
        limit: Number(limit),
        sort,
      })

      return result
    } catch (error) {
      logger.error("Get user transactions error:", error)
      throw error
    }
  }

  async getTransaction(userId: string, transactionId: string) {
    // Try to find in Transaction model first (crypto transactions)
    const transaction = await this.transactionRepo.findById(transactionId)

    if (transaction) {
      // Check ownership for crypto transaction
      if (transaction.userId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }
      return transaction
    }

    // Try to find in GiftCard model
    const giftCard = await this.giftCardRepo.findById(transactionId)

    if (giftCard) {
      // Check ownership for gift card (can be seller or buyer)
      const isOwner =
        (giftCard.sellerId && giftCard.sellerId.toString() === userId) ||
        (giftCard.buyerId && giftCard.buyerId.toString() === userId)

      if (!isOwner) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }
      return giftCard
    }

    // Try to find in GoogleVoiceOrder model
    const googleVoiceOrder = await this.googleVoiceRepo.findById(transactionId)

    if (googleVoiceOrder) {
      // Check ownership for Google Voice order
      if (googleVoiceOrder.buyerId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }
      return googleVoiceOrder
    }

    // Not found in any model
    throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
  }

  async getTransactionStats(userId: string) {
    try {
      const stats = await this.transactionRepo.getUserTransactionStats(userId)
      return stats
    } catch (error) {
      logger.error("Get transaction stats error:", error)
      throw error
    }
  }

   async cancelTransaction(userId: string, transactionId: string) {
    try {
      // Try to find in Transaction model first (crypto transactions)
      let transaction = await this.transactionRepo.findById(transactionId)
      let model: "transaction" | "giftcard" | "googlevoice" | null = null

      if (transaction) {
        // Check ownership for crypto transaction
        if (transaction.userId.toString() !== userId) {
          throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
        }
        model = "transaction"
      } else {
        // Try to find in GiftCard model
        const giftCard = await this.giftCardRepo.findById(transactionId)

        if (giftCard) {
          // Check ownership for gift card (can be seller or buyer)
          const isOwner =
            (giftCard.sellerId && giftCard.sellerId.toString() === userId) ||
            (giftCard.buyerId && giftCard.buyerId.toString() === userId)

          if (!isOwner) {
            throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
          }
          transaction = giftCard as any
          model = "giftcard"
        } else {
          // Try to find in GoogleVoiceOrder model
          const googleVoiceOrder = await this.googleVoiceRepo.findById(transactionId)

          if (googleVoiceOrder) {
            // Check ownership for Google Voice order
            if (googleVoiceOrder.buyerId.toString() !== userId) {
              throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
            }
            transaction = googleVoiceOrder as any
            model = "googlevoice"
          }
        }
      }

      if (!transaction || !model) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      // Check if transaction can be cancelled (only pending or under_review)
      if (transaction.status !== TRANSACTION_STATUS.PENDING && transaction.status !== TRANSACTION_STATUS.UNDER_REVIEW) {
        throw createError(
          `Cannot cancel transaction with status: ${transaction.status}. Only pending or under_review transactions can be cancelled.`,
          400,
          ERROR_CODES.INVALID_REQUEST,
        )
      }

      // Update status to cancelled
      if (model === "transaction") {
        await this.transactionRepo.update(transactionId, { status: TRANSACTION_STATUS.CANCELLED } as any)
      } else if (model === "giftcard") {
        await this.giftCardRepo.update(transactionId, { status: TRANSACTION_STATUS.CANCELLED } as any)
      } else if (model === "googlevoice") {
        await this.googleVoiceRepo.update(transactionId, { status: TRANSACTION_STATUS.CANCELLED } as any)
      }

      logger.info(`Transaction cancelled: ${transactionId} by user: ${userId}`)

      return {
        message: "Transaction cancelled successfully",
        transactionId,
        status: TRANSACTION_STATUS.CANCELLED,
      }
    } catch (error) {
      logger.error("Cancel transaction error:", error)
      throw error
    }
  }
}
