import { GoogleVoiceOrderRepository } from "@/repositories/google-voice-order.repository"
import { UserRepository } from "@/repositories/user.repository"
import { NotificationService } from "@/services/shared/notification.service"
import { createError } from "@/middlewares/common/error.middleware"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { encrypt } from "@/utils/encryption"
import { logger } from "@/utils/logger"

export interface DeliverGoogleVoiceDto {
  accounts: Array<{
    accountEmail: string
    phoneNumber: string
    recoveryEmail: string
    password: string
  }>
}

export class AdminGoogleVoiceService {
  private googleVoiceOrderRepo: GoogleVoiceOrderRepository
  private userRepo: UserRepository
  private notificationService: NotificationService

  constructor() {
    this.googleVoiceOrderRepo = new GoogleVoiceOrderRepository()
    this.userRepo = new UserRepository()
    this.notificationService = new NotificationService()
  }

  async getPendingOrders() {
    return this.googleVoiceOrderRepo.findPendingOrders()
  }

  async deliverOrder(adminId: string, orderId: string, data: DeliverGoogleVoiceDto) {
    try {
      const order = await this.googleVoiceOrderRepo.findById(orderId)
      if (!order) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
          404,
          ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
        )
      }

      if (order.status !== "under_review") {
        throw createError("Order is not under review", 400, ERROR_CODES.INVALID_INPUT)
      }

      if (data.accounts.length !== order.quantity) {
        throw createError(
          `Expected ${order.quantity} accounts but received ${data.accounts.length}`,
          400,
          ERROR_CODES.INVALID_INPUT,
        )
      }

      const encryptedAccounts = data.accounts.map((account) => ({
        accountEmail: account.accountEmail,
        phoneNumber: account.phoneNumber,
        recoveryEmail: account.recoveryEmail,
        encryptedPassword: encrypt(account.password),
      }))

      // Set delivery time and expiry (5 minutes)
      const deliveredAt = new Date()
      const expiresAt = new Date(deliveredAt.getTime() + 5 * 60 * 1000)

      await this.googleVoiceOrderRepo.updateStatus(orderId, "delivered", {
        accounts: encryptedAccounts,
        deliveredAt,
        expiresAt,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })

      // Get user details for email
      const user = await this.userRepo.findById(order.buyerId.toString())
      if (!user) {
        throw createError(ERROR_MESSAGES[ERROR_CODES.USER_NOT_FOUND], 404, ERROR_CODES.USER_NOT_FOUND)
      }

      await this.notificationService.send({
        userId: order.buyerId.toString(),
        userEmail: user.email,
        userName: user.name,
        type: "general",
        title: "Google Voice Accounts Delivered",
        message: `Your Google Voice order ${order.txRef} has been delivered.`,
        channels: ["email"],
        templateType: "google-voice-delivered",
        templateData: {
          txRef: order.txRef,
          quantity: order.quantity,
          accounts: data.accounts,
          expiresAt: expiresAt.toISOString(),
          reportWindowMinutes: order.reportWindowMinutes,
        },
        metadata: {
          _id: order._id,
          id: order._id,
          orderId: order._id,
          txRef: order.txRef,
          quantity: order.quantity,
          expiresAt,
        },
      })

      logger.info(`Google Voice order delivered: ${order.txRef} (${order.quantity} accounts) by admin ${adminId}`)

      return {
        message: `${order.quantity} account(s) delivered successfully. User has 5 minutes to report issues.`,
        expiresAt,
        accountsDelivered: order.quantity,
      }
    } catch (error) {
      logger.error("Deliver Google Voice order error:", error)
      throw error
    }
  }

  async resolveDispute(adminId: string, orderId: string, resolution: string) {
    try {
      const order = await this.googleVoiceOrderRepo.findById(orderId)
      if (!order) {
        throw createError(
          ERROR_MESSAGES[ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND],
          404,
          ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND,
        )
      }

      if (order.status !== "dispute") {
        throw createError("Order is not in dispute", 400, ERROR_CODES.INVALID_INPUT)
      }

      // Update order
      await this.googleVoiceOrderRepo.updateStatus(orderId, "completed", {
        completedAt: new Date(),
        metadata: {
          ...order.metadata,
          disputeResolution: resolution,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      })

      // Notify user
      await this.notificationService.send({
        userId: order.buyerId.toString(),
        type: "general",
        title: "Dispute Resolved",
        message: `Your dispute for order ${order.txRef} has been resolved. Resolution: ${resolution}`,
        channels: ["email"],
      })

      logger.info(`Google Voice dispute resolved: ${order.txRef} by admin ${adminId}`)

      return {
        message: "Dispute resolved successfully",
      }
    } catch (error) {
      logger.error("Resolve Google Voice dispute error:", error)
      throw error
    }
  }

  async getAllOrders(page = 1, limit = 20, filters: any = {}, search?: string) {
    const skip = (page - 1) * limit
    const [orders, total] = await Promise.all([
      this.googleVoiceOrderRepo.findAllWithFilters(skip, limit, filters, search),
      this.googleVoiceOrderRepo.countWithFilters(filters, search),
    ] )
    
    return {
      orders: orders.map((order: any) => ({
        _id: order._id,
        id: order._id,
        orderId: order._id,
        txRef: order.txRef,
        buyerId: order.buyerId._id,
        buyerName: order.buyerId.name,
        buyerEmail: order.buyerId.email,
        buyerPhone: order.buyerId.phone,
        quantity: order.quantity,
        priceUsd: order.priceUsd,
        priceGhs: order.priceGhs,
        totalAmount: order.priceGhs,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentDetails: order.paymentDetails,
        proofOfPayment: order.proofOfPayment,
        deliveredAt: order.deliveredAt,
        expiresAt: order.expiresAt,
        disputeReason: order.disputeReason,
        reviewedBy: order.reviewedBy ? { name: order.reviewedBy.name, email: order.reviewedBy.email } : null,
        reviewedAt: order.reviewedAt,
        completedAt: order.completedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
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
