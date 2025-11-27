import { GiftCardRepository } from "../../repositories/gift-card.repository"
import { UserRepository } from "../../repositories/user.repository"
import { NotificationService } from "../../services/shared/notification.service"
import { createError } from "../../middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes"
import { logger } from "../../utils/logger"

export interface ReviewGiftCardDto {
  status: "approved" | "rejected"
  rejectionReason?: string
}

export interface DeliverGiftCardDto {
  cardDetails: {
    pin?: string
    serial?: string
    code?: string
    redemptionUrl?: string
  }
  notes?: string
}

export class AdminGiftCardService {
  private giftCardRepo: GiftCardRepository
  private userRepo: UserRepository
  private notificationService: NotificationService

  constructor() {
    this.giftCardRepo = new GiftCardRepository()
    this.userRepo = new UserRepository()
    this.notificationService = new NotificationService()
  }

  async getPendingSellOrders() {
    return this.giftCardRepo.findPendingSellOrders()
  }

  async getPendingBuyOrders() {
    return this.giftCardRepo.findPendingBuyOrders()
  }

  async getPendingGiftCards() {
    return this.giftCardRepo.findPendingReview()
  }

  async reviewGiftCard(adminId: string, giftCardId: string, data: ReviewGiftCardDto) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      const user = await this.userRepo.findById(giftCard.sellerId?.toString() || giftCard.buyerId?.toString() || "")

      await this.giftCardRepo.updateStatus(giftCardId, data.status, {
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: data.rejectionReason,
      })

      if (giftCard.sellerId) {
        const message =
          data.status === "approved"
            ? `Your gift card ${giftCard.txRef} has been approved. We will process your payment shortly.`
            : `Your gift card ${giftCard.txRef} has been rejected. Reason: ${data.rejectionReason}`

        await this.notificationService.send({
          userId: giftCard.sellerId.toString(),
          type: "general",
          title: data.status === "approved" ? "Gift Card Approved" : "Gift Card Rejected",
          message,
          channels: ["email"],
          userEmail: user?.email,
          userName: user?.name,
          metadata: {
            giftCardId: giftCard._id,
            txRef: giftCard.txRef,
          },
        })
      }

      logger.info(`Gift card ${data.status}: ${giftCard.txRef} by admin ${adminId}`)

      return {
        message: `Gift card ${data.status} successfully`,
      }
    } catch (error) {
      logger.error("Review gift card error:", error)
      throw error
    }
  }

  async completeGiftCardSale(adminId: string, giftCardId: string) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      if (!giftCard.sellerId) {
        throw createError("This is not a sell order", 400, ERROR_CODES.INVALID_INPUT)
      }

      const user = await this.userRepo.findById(giftCard.sellerId.toString())

      await this.giftCardRepo.updateStatus(giftCardId, "completed", {
        completedAt: new Date(),
      })

      await this.notificationService.send({
        userId: giftCard.sellerId.toString(),
        type: "general",
        title: "Gift Card Sale Completed",
        message: `Your gift card ${giftCard.txRef} has been sold. Payment of GHS ${giftCard.amountToReceive} has been sent to your account.`,
        channels: ["email"],
        userEmail: user?.email,
        userName: user?.name,
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
          amount: giftCard.amountToReceive,
        },
      })

      logger.info(`Gift card sale completed: ${giftCard.txRef} by admin ${adminId}`)

      return {
        message: "Gift card sale completed successfully",
      }
    } catch (error) {
      logger.error("Complete gift card sale error:", error)
      throw error
    }
  }

  async deliverGiftCardToBuyer(adminId: string, giftCardId: string, data: DeliverGiftCardDto) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      if (!giftCard.buyerId) {
        throw createError("This is not a buy order", 400, ERROR_CODES.INVALID_INPUT)
      }

      const user = await this.userRepo.findById(giftCard.buyerId.toString())

      await this.giftCardRepo.updateStatus(giftCardId, "completed", {
        cardDetails: data.cardDetails,
        completedAt: new Date(),
        metadata: {
          ...giftCard.metadata,
          deliveredBy: adminId,
          deliveryNotes: data.notes,
        },
      })

      await this.notificationService.send({
        userId: giftCard.buyerId.toString(),
        type: "general",
        title: "Gift Card Delivered",
        message: `Your gift card purchase ${giftCard.txRef} is complete. Card details have been sent to your email.`,
        channels: ["email"],
        userEmail: user?.email,
        userName: user?.name,
        templateType: "gift-card-delivered",
        templateData: {
          userName: user?.name || "User",
          giftCardType: giftCard.type,
          faceValue: giftCard.faceValue,
          cardDetails: data.cardDetails,
          txRef: giftCard.txRef,
        },
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
          cardDetails: data.cardDetails,
        },
      })

      logger.info(`Gift card delivered to buyer: ${giftCard.txRef} by admin ${adminId}`)

      return {
        message: "Gift card delivered successfully",
      }
    } catch (error) {
      logger.error("Deliver gift card error:", error)
      throw error
    }
  }

  async cancelBuyOrder(adminId: string, giftCardId: string, reason: string) {
    try {
      const giftCard = await this.giftCardRepo.findById(giftCardId)
      if (!giftCard) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.GIFT_CARD_NOT_FOUND], 404, ERROR_CODES.GIFT_CARD_NOT_FOUND)
      }

      if (!giftCard.buyerId) {
        throw createError("This is not a buy order", 400, ERROR_CODES.INVALID_INPUT)
      }

      const user = await this.userRepo.findById(giftCard.buyerId.toString())

      await this.giftCardRepo.updateStatus(giftCardId, "rejected", {
        rejectionReason: reason,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })

      await this.notificationService.send({
        userId: giftCard.buyerId.toString(),
        type: "general",
        title: "Gift Card Order Cancelled",
        message: `Your gift card order ${giftCard.txRef} has been cancelled. Reason: ${reason}. If you made payment, it will be refunded.`,
        channels: ["email"],
        userEmail: user?.email,
        userName: user?.name,
        metadata: {
          giftCardId: giftCard._id,
          txRef: giftCard.txRef,
          reason,
        },
      })

      logger.info(`Gift card buy order cancelled: ${giftCard.txRef} by admin ${adminId}`)

      return {
        message: "Buy order cancelled successfully",
      }
    } catch (error) {
      logger.error("Cancel buy order error:", error)
      throw error
    }
  }

  async getAllGiftCards(page = 1, limit = 20, filters: any = {}, search?: string) {
    const skip = (page - 1) * limit
    const [giftCards, total] = await Promise.all([
      this.giftCardRepo.findAllWithFilters(skip, limit, filters, search),
      this.giftCardRepo.countWithFilters(filters, search),
    ])

    return {
      giftCards: giftCards.map((gc: any) => ({
        _id: gc._id,
        id: gc._id,
        giftCardId: gc._id,
        txRef: gc.txRef,
        sellerId: gc.sellerId ? gc.sellerId._id : null,
        sellerName: gc.sellerId ? gc.sellerId.name : null,
        sellerEmail: gc.sellerId ? gc.sellerId.email : null,
        buyerId: gc.buyerId ? gc.buyerId._id : null,
        buyerName: gc.buyerId ? gc.buyerId.name : null,
        buyerEmail: gc.buyerId ? gc.buyerId.email : null,
        type: gc.type,
        status: gc.status,
        faceValue: gc.faceValue,
        amountToReceive: gc.amountToReceive,
        photos: gc.photos,
        receiptPhoto: gc.receiptPhoto,
        cardDetails: gc.cardDetails,
        reviewedBy: gc.reviewedBy ? { name: gc.reviewedBy.name, email: gc.reviewedBy.email } : null,
        reviewedAt: gc.reviewedAt,
        completedAt: gc.completedAt,
        rejectionReason: gc.rejectionReason,
        createdAt: gc.createdAt,
        updatedAt: gc.updatedAt,
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
