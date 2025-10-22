import { TransactionRepository } from "@/repositories/transaction.repository"
import { UserRepository } from "@/repositories/user.repository"
import { PlatformConfigRepository } from "@/repositories/platform-config.repository"
import { NotificationService } from "@/services/shared/notification.service"
import { createError } from "@/middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { TRANSACTION_STATUS, TRANSACTION_TYPE, KYC_STATUS } from "@/constants/statuses"
import { logger } from "@/utils/logger"
import { v4 as uuidv4 } from "uuid"
import { KycRepository } from "@/repositories/kyc.repository";

export interface SellCryptoDto {
  cryptocurrency: string
  amountCrypto?: number
  amountFiat?: number
  paymentMethod: string
  paymentMethodIndex: number
  termsAccepted: boolean
}

export interface BuyCryptoDto {
  cryptocurrency: string
  amountFiat: number
  walletAddress: string
  paymentMethod: string
  paymentMethodIndex?: number
  termsAccepted: boolean
}

export class CryptoTradingService {
  private transactionRepo: TransactionRepository
  private userRepo: UserRepository
  private platformConfigRepo: PlatformConfigRepository
  private kycRepo: KycRepository // Added KYC repository
  private notificationService: NotificationService

  constructor() {
    this.transactionRepo = new TransactionRepository()
    this.userRepo = new UserRepository()
    this.platformConfigRepo = new PlatformConfigRepository()
    this.kycRepo = new KycRepository() // Initialize KYC repository
    this.notificationService = new NotificationService()
  }

  async sellCrypto(userId: string, data: SellCryptoDto) {
    try {
      // Verify user and KYC
      const user = await this.userRepo.findById(userId)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      const kyc = await this.kycRepo.findLatestByUserId(userId)
      if (!kyc || kyc.status !== KYC_STATUS.APPROVED) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.KYC_NOT_APPROVED], 403, ERROR_CODES.KYC_NOT_APPROVED)
      }

      // Verify payment method exists and is verified
      const paymentMethod = user.paymentMethods[data.paymentMethodIndex]
      if (!paymentMethod) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_NOT_FOUND],
          404,
          ERROR_CODES.PAYMENT_METHOD_NOT_FOUND,
        )
      }

      if (!paymentMethod.verified) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_NOT_VERIFIED],
          400,
          ERROR_CODES.PAYMENT_METHOD_NOT_VERIFIED,
        )
      }

      // Get current rate (will be implemented in rates service)
      const rateUsed = 50000 // Placeholder - will fetch from rates service

      // Calculate amounts
      let amountCrypto = data.amountCrypto
      let amountFiat = data.amountFiat

      if (amountCrypto && !amountFiat) {
        amountFiat = amountCrypto * rateUsed
      } else if (amountFiat && !amountCrypto) {
        amountCrypto = amountFiat / rateUsed
      }

      // Get platform wallet address
      const wallets = await this.platformConfigRepo.getWalletAddresses()
      const platformWalletAddress = (wallets as any)[data.cryptocurrency] || ""

      // Create transaction
      const txRef = `SELL-${uuidv4()}`
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

      const transaction = await this.transactionRepo.create({
        userId,
        type: TRANSACTION_TYPE.SELL_CRYPTO,
        status: TRANSACTION_STATUS.PENDING,
        cryptocurrency: data.cryptocurrency,
        amountCrypto,
        amountFiat,
        rateUsed,
        platformWalletAddress,
        paymentMethod: data.paymentMethod,
        paymentDetails: paymentMethod.details,
        adapter: "manual",
        txRef,
        termsAccepted: data.termsAccepted,
        expiresAt,
      } as any)

      logger.info(`Sell crypto transaction created: ${txRef}`)

      return {
        transaction: {
          id: transaction._id,
          txRef: transaction.txRef,
          type: transaction.type,
          status: transaction.status,
          cryptocurrency: transaction.cryptocurrency,
          amountCrypto: transaction.amountCrypto,
          amountFiat: transaction.amountFiat,
          rateUsed: transaction.rateUsed,
          platformWalletAddress: transaction.platformWalletAddress,
          expiresAt: transaction.expiresAt,
          createdAt: transaction.createdAt,
        },
        message: "Transaction created. Please send crypto to the platform wallet address.",
      }
    } catch (error) {
      logger.error("Sell crypto error:", error)
      throw error
    }
  }

  async buyCrypto(userId: string, data: BuyCryptoDto) {
    try {
      // Verify user and KYC
      const user = await this.userRepo.findById(userId)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      const kyc = await this.kycRepo.findLatestByUserId(userId)
      if (!kyc || kyc.status !== KYC_STATUS.APPROVED) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.KYC_NOT_APPROVED], 403, ERROR_CODES.KYC_NOT_APPROVED)
      }

      // Get current rate (will be implemented in rates service)
      const rateUsed = 52000 // Placeholder - will fetch from rates service

      // Calculate crypto amount
      const amountCrypto = data.amountFiat / rateUsed

      // Get platform payment details
      const paymentDetails = await this.platformConfigRepo.getPaymentDetails()

      // Create transaction
      const txRef = `BUY-${uuidv4()}`

      const transaction = await this.transactionRepo.create({
        userId,
        type: TRANSACTION_TYPE.BUY_CRYPTO,
        status: TRANSACTION_STATUS.PENDING,
        cryptocurrency: data.cryptocurrency,
        amountCrypto,
        amountFiat: data.amountFiat,
        rateUsed,
        walletAddress: data.walletAddress,
        paymentMethod: data.paymentMethod,
        adapter: data.paymentMethod === "paystack" ? "paystack" : "manual",
        txRef,
        termsAccepted: data.termsAccepted,
        metadata: {
          platformPaymentDetails: paymentDetails,
        },
      } as any)

      logger.info(`Buy crypto transaction created: ${txRef}`)

      return {
        transaction: {
          id: transaction._id,
          txRef: transaction.txRef,
          type: transaction.type,
          status: transaction.status,
          cryptocurrency: transaction.cryptocurrency,
          amountCrypto: transaction.amountCrypto,
          amountFiat: transaction.amountFiat,
          rateUsed: transaction.rateUsed,
          walletAddress: transaction.walletAddress,
          paymentMethod: transaction.paymentMethod,
          createdAt: transaction.createdAt,
        },
        platformPaymentDetails: paymentDetails,
        message: "Transaction created. Please make payment to proceed.",
      }
    } catch (error) {
      logger.error("Buy crypto error:", error)
      throw error
    }
  }

  async iHaveSent(userId: string, transactionId: string, proofOfSend?: string) {
    try {
      const transaction = await this.transactionRepo.findById(transactionId)
      if (!transaction) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      if (transaction.userId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      if (transaction.type !== TRANSACTION_TYPE.SELL_CRYPTO) {
        throw createError("This action is only for sell crypto transactions", 400, ERROR_CODES.INVALID_INPUT)
      }

      if (transaction.status !== TRANSACTION_STATUS.PENDING) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.TRANSACTION_ALREADY_COMPLETED],
          400,
          ERROR_CODES.TRANSACTION_ALREADY_COMPLETED,
        )
      }

      const user = await this.userRepo.findById(userId)

      // Update transaction status
      await this.transactionRepo.updateStatus(transactionId, TRANSACTION_STATUS.UNDER_REVIEW, {
        proofOfSend,
        metadata: {
          ...transaction.metadata,
          sentAt: new Date(),
        },
      })

      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "User Has Sent Crypto",
        message: `User has clicked "I Have Sent" for transaction ${transaction.txRef}. Please verify blockchain receipt.`,
        channels: ["email"],
        userEmail: process.env.ADMIN_EMAIL || "admin@spedxpay.com",
        userName: "Admin",
        templateType: "admin-crypto-sent",
        templateData: {
          userName: user?.name || "User",
          userEmail: user?.email || "",
          txRef: transaction.txRef,
          cryptocurrency: transaction.cryptocurrency,
          amount: transaction.amountCrypto,
          reviewLink: `${process.env.FRONTEND_URL}/admin/transactions/${transaction._id}`,
        },
        metadata: {
          transactionId: (transaction._id as string).toString(),
          txRef: transaction.txRef,
          cryptocurrency: transaction.cryptocurrency,
          amount: transaction.amountCrypto,
          link: `/admin/transactions/${transaction._id}`,
        },
      })

      logger.info(`User marked crypto as sent: ${transaction.txRef}`)

      return {
        message: "Transaction marked as sent. Admin will verify and process your payment.",
      }
    } catch (error) {
      logger.error("I have sent error:", error)
      throw error
    }
  }

  async iHavePaid(userId: string, transactionId: string, proofOfPayment?: string) {
    try {
      const transaction = await this.transactionRepo.findById(transactionId)
      if (!transaction) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
      }

      if (transaction.userId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      if (transaction.type !== TRANSACTION_TYPE.BUY_CRYPTO) {
        throw createError("This action is only for buy crypto transactions", 400, ERROR_CODES.INVALID_INPUT)
      }

      if (transaction.status !== TRANSACTION_STATUS.PENDING) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.TRANSACTION_ALREADY_COMPLETED],
          400,
          ERROR_CODES.TRANSACTION_ALREADY_COMPLETED,
        )
      }

      const user = await this.userRepo.findById(userId)

      // Update transaction status
      await this.transactionRepo.updateStatus(transactionId, TRANSACTION_STATUS.UNDER_REVIEW, {
        proofOfPayment,
        metadata: {
          ...transaction.metadata,
          paidAt: new Date(),
        },
      })

      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "User Has Paid",
        message: `User has clicked "I Have Paid" for transaction ${transaction.txRef}. Please verify payment.`,
        channels: ["email"],
        userEmail: process.env.ADMIN_EMAIL || "admin@spedxpay.com",
        userName: "Admin",
        templateType: "admin-payment-received",
        templateData: {
          userName: user?.name || "User",
          userEmail: user?.email || "",
          txRef: transaction.txRef,
          cryptocurrency: transaction.cryptocurrency,
          amount: transaction.amountFiat,
          reviewLink: `${process.env.FRONTEND_URL}/admin/transactions/${transaction._id}`,
        },
        metadata: {
          transactionId: (transaction._id as string).toString(),
          txRef: transaction.txRef,
          cryptocurrency: transaction.cryptocurrency,
          amount: transaction.amountFiat,
          link: `/admin/transactions/${transaction._id}`,
        },
      })

      logger.info(`User marked payment as sent: ${transaction.txRef}`)

      return {
        message: "Payment confirmation received. Admin will verify and send crypto to your wallet.",
      }
    } catch (error) {
      logger.error("I have paid error:", error)
      throw error
    }
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepo.findById(transactionId)
    if (!transaction) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.TRANSACTION_NOT_FOUND], 404, ERROR_CODES.TRANSACTION_NOT_FOUND)
    }

    if (transaction.userId.toString() !== userId) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
    }

    return transaction
  }

  async getUserTransactions(userId: string, status?: string) {
    return this.transactionRepo.findByUserId(userId, status)
  }

  async getPlatformWallets() {
    return this.platformConfigRepo.getWalletAddresses()
  }

  async getPlatformPaymentDetails() {
    return this.platformConfigRepo.getPaymentDetails()
  }
}
