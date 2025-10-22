import type { Response, NextFunction, Request } from "express"
import type { AuthRequest } from "@/middlewares/auth/auth.middleware"
import { GiftCardService } from "@/services/gift-card/gift-card.service"
import { successResponse } from "@/utils/response-formatter"
import { asyncHandler } from "@/middlewares/common/error.middleware"

export class GiftCardController {
  private giftCardService: GiftCardService

  constructor() {
    this.giftCardService = new GiftCardService()
  }

  getAvailableTypes = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const types = await this.giftCardService.getAvailableTypes()
    res.status(200).json(successResponse("Available gift card types retrieved", types))
  })

  sellGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.giftCardService.sellGiftCard(userId, req.body)
    res.status(201).json(successResponse("Gift card submitted for sale", result))
  })

  buyGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.giftCardService.buyGiftCard(userId, req.body)
    res.status(200).json(successResponse("Gift card purchase initiated", result))
  })

  iHavePaidForGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { giftCardId } = req.params
    const { proofOfPayment } = req.body
    const result = await this.giftCardService.iHavePaidForGiftCard(userId, giftCardId, proofOfPayment)
    res.status(200).json(successResponse("Payment confirmation received", result))
  })

  iHaveSentGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { giftCardId } = req.params
    const { proofOfSend } = req.body
    const result = await this.giftCardService.iHaveSentGiftCard(userId, giftCardId, proofOfSend)
    res.status(200).json(successResponse("Gift card marked as sent", result))
  })

  getUserSoldGiftCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { status } = req.query
    const giftCards = await this.giftCardService.getUserSoldGiftCards(userId, status as string)
    res.status(200).json(successResponse("Sold gift cards retrieved", giftCards))
  })

  getUserPurchasedGiftCards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const giftCards = await this.giftCardService.getUserPurchasedGiftCards(userId)
    res.status(200).json(successResponse("Purchased gift cards retrieved", giftCards))
  })

  getGiftCard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { giftCardId } = req.params
    const giftCard = await this.giftCardService.getGiftCard(userId, giftCardId)
    res.status(200).json(successResponse("Gift card retrieved", giftCard))
  })
}
