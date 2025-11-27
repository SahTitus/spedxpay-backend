import { GoogleVoiceOrderRepository } from "../../repositories/google-voice-order.repository"
import { UserRepository } from "../../repositories/user.repository"
import { NotificationService } from "../../services/shared/notification.service"
import { createError } from "../../middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes"
import { logger } from "../../utils/logger"
import { v4 as uuidv4 } from "uuid"

export interface CreateGoogleVoiceOrderDto {
  quantity: number
  paymentMethod: string
}

export interface ReportIssueDto {
  reason: string
}

export class GoogleVoiceService {
  private googleVoiceOrderRepo: GoogleVoiceOrderRepository
  private userRepo: UserRepository
  private notificationService: NotificationService

  constructor() {
    this.googleVoiceOrderRepo = new GoogleVoiceOrderRepository()
    this.userRepo = new UserRepository()
    this.notificationService = new NotificationService()
  }

  async createOrder(userId: string, data: CreateGoogleVoiceOrderDto) {
    try {
      const user = await this.userRepo.findById(userId)
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      // Pricing 
      const priceUsd = 10 * data.quantity
      const priceGhs = priceUsd * 15 

      // Create order
      const txRef = `GV-${uuidv4()}`

      const order = await this.googleVoiceOrderRepo.create({
        buyerId: userId,
        quantity: data.quantity,
        priceUsd,
        priceGhs,
        status: "pending",
        paymentMethod: data.paymentMethod,
        txRef,
        reportWindowMinutes: 5,
      } as any)

      logger.info(`Google Voice order created: ${txRef} (${data.quantity} accounts)`)

      return {
          _id: order._id,
          id: order._id,
          txRef: order.txRef,
          quantity: order.quantity,
          priceUsd: order.priceUsd,
          priceGhs: order.priceGhs,
          status: order.status,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
      }
    } catch (error) {
      logger.error("Create Google Voice order error:", error)
      throw error
    }
  }

  async iHavePaid(userId: string, orderId: string, proofOfPayment?: string) {
    try {
      const order = await this.googleVoiceOrderRepo.findById(orderId)
      if (!order) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
          404,
          ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
        )
      }

      if (order.buyerId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      if (order.status !== "pending") {
        throw createError("Order is not in pending status", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Update status
      await this.googleVoiceOrderRepo.updateStatus(orderId, "under_review", {
        metadata: {
          ...order.metadata,
          proofOfPayment,
          paidAt: new Date(),
        },
      })

      // Notify admin
      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "Google Voice Payment Received",
        message: `User has clicked "I Have Paid" for Google Voice order ${order.txRef}. Please verify payment and assign account.`,
        channels: ["email"],
        metadata: {
          orderId: order._id,
          txRef: order.txRef,
          link: `/admin/google-voice/${order._id}`,
        },
      })

      logger.info(`User marked Google Voice payment as sent: ${order.txRef}`)

      return {
        message: "Payment confirmation received. Admin will verify and deliver account details.",
      }
    } catch (error) {
      logger.error("I have paid for Google Voice error:", error)
      throw error
    }
  }

  async reportIssue(userId: string, orderId: string, data: ReportIssueDto) {
    try {
      const order = await this.googleVoiceOrderRepo.findById(orderId)
      if (!order) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
          404,
          ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
        )
      }

      if (order.buyerId.toString() !== userId) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
      }

      if (order.status !== "delivered") {
        throw createError("Can only report issues for delivered orders", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Check if within 5-minute window
      if (!order.expiresAt || new Date() > order.expiresAt) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.DISPUTE_WINDOW_EXPIRED], 400, ERROR_CODES.DISPUTE_WINDOW_EXPIRED)
      }

      // Update status to dispute
      await this.googleVoiceOrderRepo.updateStatus(orderId, "dispute", {
        disputeReason: data.reason,
        disputeReportedAt: new Date(),
      })

      // Notify admin
      await this.notificationService.send({
        userId: userId,
        type: "admin_alert",
        title: "Google Voice Dispute Reported",
        message: `User has reported an issue with Google Voice order ${order.txRef} within the 5-minute window. Reason: ${data.reason}`,
        channels: ["email"],
        metadata: {
          orderId: order._id,
          txRef: order.txRef,
          reason: data.reason,
          link: `/admin/google-voice/${order._id}`,
        },
      })

      logger.info(`Dispute reported for Google Voice order: ${order.txRef}`)

      return {
        message: "Issue reported successfully. Admin will investigate and resolve.",
      }
    } catch (error) {
      logger.error("Report Google Voice issue error:", error)
      throw error
    }
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.googleVoiceOrderRepo.findById(orderId)
    if (!order) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
        404,
        ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
      )
    }

    if (order.buyerId.toString() !== userId) {
      throw createError(ERROR_MESSAGES[ERROR_CODES.FORBIDDEN], 403, ERROR_CODES.FORBIDDEN)
    }

    return order
  }

  async getUserOrders(userId: string, status?: string) {
    return this.googleVoiceOrderRepo.findByBuyerId(userId, status)
  }

  async checkDisputeWindow(orderId: string) {
    const order = await this.googleVoiceOrderRepo.findById(orderId)
    if (!order) {
      throw createError(
        ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
        404,
        ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
      )
    }

    if (order.status !== "delivered" || !order.expiresAt) {
      return {
        canReportIssue: false,
        message: "Order is not in delivered status",
      }
    }

    const now = new Date()
    const canReportIssue = now <= order.expiresAt
    const timeRemaining = canReportIssue ? Math.max(0, order.expiresAt.getTime() - now.getTime()) : 0

    return {
      canReportIssue,
      timeRemaining,
      expiresAt: order.expiresAt,
      message: canReportIssue
        ? `You have ${Math.ceil(timeRemaining / 1000 / 60)} minutes remaining to report issues`
        : "Dispute window has expired",
    }
  }

  async autoCompleteExpiredOrders() {
    try {
      const expiredOrders = await this.googleVoiceOrderRepo.findExpiredDisputeWindows()

      for (const order of expiredOrders) {
        await this.googleVoiceOrderRepo.updateStatus(String(order._id), "completed", {
          completedAt: new Date(),
        })

        // Notify user
        await this.notificationService.send({
          userId: order.buyerId.toString(),
          type: "general",
          title: "Google Voice Order Completed",
          message: `Your Google Voice order ${order.txRef} has been completed. The 5-minute dispute window has expired.`,
          channels: ["email"],
        })

        logger.info(`Auto-completed Google Voice order: ${order.txRef}`)
      }

      return {
        completedCount: expiredOrders.length,
      }
    } catch (error) {
      logger.error("Auto-complete expired orders error:", error)
      throw error
    }
  }
}
