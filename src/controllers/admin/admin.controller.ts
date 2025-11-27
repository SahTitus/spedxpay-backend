import type { Response, NextFunction } from "express"
import type { AuthRequest } from "../../middlewares/auth/auth.middleware"
import { AdminKycService } from "../../services/admin/admin-kyc.service"
import { AdminTransactionService } from "../../services/admin/admin-transaction.service"
import { AdminGiftCardService } from "../../services/admin/admin-gift-card.service"
import { AdminGoogleVoiceService } from "../../services/admin/admin-google-voice.service"
import { AdminConfigService } from "../../services/admin/admin-config.service"
import { AdminGiftCardTypeService } from "../../services/admin/admin-gift-card-type.service"
import { successResponse } from "../../utils/response-formatter"
import { asyncHandler } from "../../middlewares/common/error.middleware"

export class AdminController {
  private adminKycService: AdminKycService
  private adminTransactionService: AdminTransactionService
  private adminGiftCardService: AdminGiftCardService
  private adminGoogleVoiceService: AdminGoogleVoiceService
  private adminConfigService: AdminConfigService
  private adminGiftCardTypeService: AdminGiftCardTypeService

  constructor() {
    this.adminKycService = new AdminKycService()
    this.adminTransactionService = new AdminTransactionService()
    this.adminGiftCardService = new AdminGiftCardService()
    this.adminGoogleVoiceService = new AdminGoogleVoiceService()
    this.adminConfigService = new AdminConfigService()
    this.adminGiftCardTypeService = new AdminGiftCardTypeService()
  }

  // KYC Management
  getPendingKyc = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const submissions = await this.adminKycService.getPendingKyc()
    res.status(200).json(successResponse("Pending KYC retrieved", submissions))
  })

  getAllKycSubmissions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      status: req.query.status as string,
    }
    const search = req.query.search as string
    const result = await this.adminKycService.getAllSubmissions(page, limit, filters, search)
    res.status(200).json(successResponse("All KYC submissions retrieved", result))
  })

  getKycDetails = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { kycId } = req.params
    const kyc = await this.adminKycService.getKycDetails(kycId)
    res.status(200).json(successResponse("KYC details retrieved", kyc))
  })

  reviewKyc = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { kycId } = req.params
    const result = await this.adminKycService.reviewKyc(adminId, kycId, req.body)
    res.status(200).json(successResponse("KYC reviewed successfully", result))
  })

  // Transaction Management
  getPendingTransactions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await this.adminTransactionService.getPendingTransactions()
    res.status(200).json(successResponse("Pending transactions retrieved", transactions))
  })

  getAllTransactions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      status: req.query.status as string,
      type: req.query.type as string,
      cryptocurrency: req.query.cryptocurrency as string,
    }
    const search = req.query.search as string
    const result = await this.adminTransactionService.getAllTransactions(page, limit, filters, search)
    res.status(200).json(successResponse("All transactions retrieved", result))
  })

  getTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { transactionId } = req.params
    const transaction = await this.adminTransactionService.getTransaction(transactionId)
    res.status(200).json(successResponse("Transaction retrieved", transaction))
  })

  confirmPayment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { transactionId } = req.params
    const result = await this.adminTransactionService.confirmPayment(adminId, transactionId, req.body)
    res.status(200).json(successResponse("Payment confirmed", result))
  })

  completeTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { transactionId } = req.params
    const result = await this.adminTransactionService.completeTransaction(adminId, transactionId, req.body)
    res.status(200).json(successResponse("Transaction completed", result))
  })

  rejectTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { transactionId } = req.params
    const result = await this.adminTransactionService.rejectTransaction(adminId, transactionId, req.body)
    res.status(200).json(successResponse("Transaction rejected", result))
  })

  // Gift Card Management
  getPendingGiftCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const giftCards = await this.adminGiftCardService.getPendingGiftCards()
    res.status(200).json(successResponse("Pending gift cards retrieved", giftCards))
  })

  getPendingSellOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const sellOrders = await this.adminGiftCardService.getPendingSellOrders()
    res.status(200).json(successResponse("Pending sell orders retrieved", sellOrders))
  })

  getPendingBuyOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const buyOrders = await this.adminGiftCardService.getPendingBuyOrders()
    res.status(200).json(successResponse("Pending buy orders retrieved", buyOrders))
  })

  getAllGiftCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      status: req.query.status as string,
      orderType: req.query.orderType as string,
      type: req.query.type as string,
    }
    const search = req.query.search as string
    const result = await this.adminGiftCardService.getAllGiftCards(page, limit, filters, search)
    res.status(200).json(successResponse("All gift cards retrieved", result))
  })

  reviewGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { giftCardId } = req.params
    const result = await this.adminGiftCardService.reviewGiftCard(adminId, giftCardId, req.body)
    res.status(200).json(successResponse("Gift card reviewed", result))
  })

  completeGiftCardSale = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { giftCardId } = req.params
    const result = await this.adminGiftCardService.completeGiftCardSale(adminId, giftCardId)
    res.status(200).json(successResponse("Gift card sale completed", result))
  })

  deliverGiftCardToBuyer = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { giftCardId } = req.params
    const result = await this.adminGiftCardService.deliverGiftCardToBuyer(adminId, giftCardId, req.body)
    res.status(200).json(successResponse("Gift card delivered", result))
  })

  cancelBuyOrder = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { giftCardId } = req.params
    const { reason } = req.body
    const result = await this.adminGiftCardService.cancelBuyOrder(adminId, giftCardId, reason)
    res.status(200).json(successResponse("Buy order cancelled", result))
  })

  // Google Voice Management
  getPendingGoogleVoiceOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orders = await this.adminGoogleVoiceService.getPendingOrders()
    res.status(200).json(successResponse("Pending Google Voice orders retrieved", orders))
  })

  getAllGoogleVoiceOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      status: req.query.status as string,
    }
    const search = req.query.search as string
    const result = await this.adminGoogleVoiceService.getAllOrders(page, limit, filters, search)
    res.status(200).json(successResponse("All Google Voice orders retrieved", result))
  })

  deliverGoogleVoiceOrder = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { orderId } = req.params
    const result = await this.adminGoogleVoiceService.deliverOrder(adminId, orderId, req.body)
    res.status(200).json(successResponse("Google Voice order delivered", result))
  })

  resolveGoogleVoiceDispute = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const { orderId } = req.params
    const { resolution } = req.body
    const result = await this.adminGoogleVoiceService.resolveDispute(adminId, orderId, resolution)
    res.status(200).json(successResponse("Dispute resolved", result))
  })

  // Platform Configuration
  getPlatformConfig = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const config = await this.adminConfigService.getPlatformConfig()
    res.status(200).json(successResponse("Platform configuration retrieved", config))
  })

  updatePlatformConfig = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const adminId = req.user!.userId
    const result = await this.adminConfigService.updatePlatformConfig(adminId, req.body)
    res.status(200).json(successResponse("Platform configuration updated", result))
  })

  // Gift Card Type Management
  createGiftCardType = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const giftCardType = await this.adminGiftCardTypeService.createGiftCardType(req.body)
    res.status(201).json(successResponse("Gift card type created successfully", giftCardType))
  })

  getAllGiftCardTypes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const activeOnly = req.query.activeOnly === "true"
    const giftCardTypes = await this.adminGiftCardTypeService.getAllGiftCardTypes(activeOnly)
    res.status(200).json(successResponse("Gift card types retrieved", giftCardTypes))
  })

  getGiftCardType = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { typeId } = req.params
    const giftCardType = await this.adminGiftCardTypeService.getGiftCardType(typeId)
    res.status(200).json(successResponse("Gift card type retrieved", giftCardType))
  })

  updateGiftCardType = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { typeId } = req.params
    const giftCardType = await this.adminGiftCardTypeService.updateGiftCardType(typeId, req.body)
    res.status(200).json(successResponse("Gift card type updated successfully", giftCardType))
  })

  deleteGiftCardType = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { typeId } = req.params
    const result = await this.adminGiftCardTypeService.deleteGiftCardType(typeId)
    res.status(200).json(successResponse("Gift card type deleted successfully", result))
  })
}
