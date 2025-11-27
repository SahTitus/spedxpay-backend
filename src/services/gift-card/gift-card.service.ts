import { GiftCardRepository } from "../../repositories/gift-card.repository"
import { UserRepository } from "../../repositories/user.repository"
import { KycRepository } from "../../repositories/kyc.repository" 
import { GiftCardTypeRepository } from "../../repositories/gift-card-type.repository"
import { NotificationService } from "../../services/shared/notification.service"
import { createError } from "../../middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes"
import { KYC_STATUS } from "../../constants/statuses"
import { logger } from "../../utils/logger"
import { v4 as uuidv4 } from "uuid"

export interface SellGiftCardDto {
  type: string
  faceValue: number
  cardForm: "electronic" | "physical"
  cardDetails?: {
    pin?: string
    serial?: string
  }
  photos?: {
    front?: string
    back?: string
  }
  receiptPhoto?: string
  paymentMethod: string
  paymentMethodIndex: number
}

export interface BuyGiftCardDto {
  type: string
  faceValue: number
  paymentMethod: string
}

export class GiftCardService {
  private giftCardRepo: GiftCardRepository
  private userRepo: UserRepository
  private kycRepo: KycRepository // Added KYC repository
  private giftCardTypeRepo: GiftCardTypeRepository // Added GiftCardTypeRepository
  private notificationService: NotificationService

  constructor() {
    this.giftCardRepo = new GiftCardRepository()
    this.userRepo = new UserRepository()
    this.kycRepo = new KycRepository() // Initialize KYC repository
    this.giftCardTypeRepo = new GiftCardTypeRepository() // Initialize GiftCardTypeRepository
    this.notificationService = new NotificationService()
  }

  async getAvailableTypes() {
    return this.giftCardTypeRepo.findAll(true) // Only active types
  }

  async sellGiftCard(userId: string, data: SellGiftCardDto) {
    try {
      const giftCardType = await this.giftCardTypeRepo.findByCode(data.type)
      if (!giftCardType || !giftCardType.isActive) {
        throw createError("Invalid or inactive gift card type", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Verify user and KYC
      const user = await this.userRepo.findById(userId)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      const kyc = await this.kycRepo.findLatestByUserId(userId)
      if (!kyc || kyc.status !== KYC_STATUS.APPROVED) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.KYC_NOT_APPROVED], 403, ERROR_CODES.KYC_NOT_APPROVED)
      }

      // Verify payment method
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

      // Validate card form requirements
      if (data.cardForm === "electronic" && (!data.cardDetails?.pin || !data.cardDetails?.serial)) {
        throw createError("Electronic cards require PIN and serial number", 400, ERROR_CODES.INVALID_INPUT)
      }

      if (data.cardForm === "physical" && (!data.photos?.front || !data.photos?.back)) {
        throw createError("Physical cards require front and back photos", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Calculate amount to receive (70% of face value as example)
      const amountToReceive = data.faceValue * 0.7

      // Create gift card
      const txRef = `SELL-GC-${uuidv4()}`

      const giftCard = await this.giftCardRepo.create({
        sellerId: userId,
        type: data.type,
        faceValue: data.faceValue,
        amountToReceive,
        cardForm: data.cardForm,
        cardDetails: data.cardDetails,
        photos: data.photos,
        receiptPhoto: data.receiptPhoto,
        status: "pending",
        paymentMethod: data.paymentMethod,
        paymentDetails: paymentMethod.details,
        txRef,
      } as any)

      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "Gift Card Sale Created",
        message: `Your gift card sale order has been created. Please go sell your gift card and click "I Have Sent" to notify our team.`,
        channels: ["email"],
        userEmail: user.email,
        userName: user.name,
        templateType: "gift-card-sell-created",
        templateData: {
          userName: user.name,
          giftCardType: data.type,
          faceValue: data.faceValue,
          amountToReceive,
          txRef: giftCard.txRef,
          dashboardLink: `${process.env.FRONTEND_URL}/dashboard/gift-cards/${giftCard._id}`,
        },
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
        },
      })

      logger.info(`Gift card sale order created: ${txRef}`)

      return {
        order: {
          _id: giftCard._id,
          id: giftCard._id,
          txRef: giftCard.txRef,
          type: giftCard.type,
          faceValue: giftCard.faceValue,
          amountToReceive: giftCard.amountToReceive,
          status: giftCard.status,
          createdAt: giftCard.createdAt,
        },
        message: "Gift card sale order created. Please sell your card and click 'I Have Sent' to proceed.",
      }
    } catch (error) {
      logger.error("Sell gift card error:", error)
      throw error
    }
  }

  async buyGiftCard(userId: string, data: BuyGiftCardDto) {
    try {
      const giftCardType = await this.giftCardTypeRepo.findByCode(data.type)
      if (!giftCardType || !giftCardType.isActive) {
        throw createError("Invalid or inactive gift card type", 400, ERROR_CODES.INVALID_INPUT)
      }

      const user = await this.userRepo.findById(userId)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      const price = data.faceValue * 1.2

      const txRef = `BUY-GC-${uuidv4()}`

      const giftCard = await this.giftCardRepo.create({
        buyerId: userId,
        type: data.type,
        faceValue: data.faceValue,
        price,
        status: "pending",
        paymentMethod: data.paymentMethod,
        txRef,
        cardForm: "electronic", // Default for buying
      } as any)

      logger.info(`Gift card purchase initiated: ${txRef}`)

      return {
        giftCard: {
          id: giftCard._id,
          txRef: giftCard.txRef,
          type: giftCard.type,
          faceValue: giftCard.faceValue,
          price: giftCard.price,
        },
        message: "Gift card purchase initiated. Please complete payment.",
      }
    } catch (error) {
      logger.error("Buy gift card error:", error)
      throw error
    }
  }

  async iHavePaidForGiftCard(userId: string, giftCardId: string, proofOfPayment?: string) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      if (giftCard.buyerId && giftCard.buyerId?.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }
      if (giftCard.sellerId && giftCard.sellerId?.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      // Update status
      await this.giftCardRepo.updateStatus(giftCardId, "under_review", {
        metadata: {
          ...giftCard.metadata,
          proofOfPayment,
          paidAt: new Date(),
        },
      })

      // Notify admin
      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "Gift Card Payment Received",
        message: `User has clicked "I Have Paid" for gift card ${giftCard.txRef}. Please verify payment.`,
        channels: ["email"],
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
          link: `/admin/gift-cards/${giftCard._id}`,
        },
      })

      logger.info(`User marked gift card payment as sent: ${giftCard.txRef}`)

      return {
        message: "Payment confirmation received. Admin will verify and send card details.",
      }
    } catch (error) {
      logger.error("I have paid for gift card error:", error)
      throw error
    }
  }

  async getUserSoldGiftCards(userId: string, status?: string) {
    return this.giftCardRepo.findBySellerId(userId, status)
  }

  async getUserPurchasedGiftCards(userId: string) {
    return this.giftCardRepo.findByBuyerId(userId)
  }

  async getGiftCard(userId: string, giftCardId: string) {
    const giftCard = await this.giftCardRepo.findById(giftCardId)
    if (!giftCard) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
    }

    // Check if user is seller or buyer
    if (giftCard.sellerId?.toString() !== userId && giftCard.buyerId?.toString() !== userId) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
    }

    return giftCard
  }

  async iHaveSentGiftCard(userId: string, giftCardId: string, proofOfSend?: string) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      console.log(giftCard.sellerId?.toString(), userId)
      if (giftCard.sellerId?.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      if (giftCard.status !== "pending") {
        throw createError("Gift card is not in pending status", 400, ERROR_CODES.INVALID_INPUT)
      }

      const user = await this.userRepo.findById(userId)

      // Update status to under_review
      await this.giftCardRepo.updateStatus(giftCardId, "under_review", {
        metadata: {
          ...giftCard.metadata,
          proofOfSend,
          sentAt: new Date(),
        },
      })

      // Notify admin
      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "User Has Sent Gift Card",
        message: `User ${user?.name} has clicked "I Have Sent" for gift card ${giftCard.txRef}. Please review the submission.`,
        channels: ["email"],
        userEmail: process.env.ADMIN_EMAIL || "admin@spedxpay.com",
        userName: "Admin",
        templateType: "admin-gift-card-sent",
        templateData: {
          userName: user?.name || "User",
          userEmail: user?.email || "",
          txRef: giftCard.txRef,
          giftCardType: giftCard.type,
          faceValue: giftCard.faceValue,
          reviewLink: `${process.env.FRONTEND_URL}/admin/gift-cards/${giftCard._id}`,
        },
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
          type: giftCard.type,
          faceValue: giftCard.faceValue,
          link: `/admin/gift-cards/${giftCard._id}`,
        },
      })

      logger.info(`User marked gift card as sent: ${giftCard.txRef}`)

      return {
        message: "Gift card marked as sent. Admin will review and process your payment.",
      }
    } catch (error) {
      logger.error("I have sent gift card error:", error)
      throw error
    }
  }
}
