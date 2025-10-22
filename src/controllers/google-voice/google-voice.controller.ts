import type { Response, NextFunction } from "express"
import type { AuthRequest } from "@/middlewares/auth/auth.middleware"
import { GoogleVoiceService } from "@/services/google-voice/google-voice.service"
import { successResponse } from "@/utils/response-formatter"
import { asyncHandler } from "@/middlewares/common/error.middleware"

export class GoogleVoiceController {
  private googleVoiceService: GoogleVoiceService

  constructor() {
    this.googleVoiceService = new GoogleVoiceService()
  }

  createOrder = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.googleVoiceService.createOrder(userId, req.body)
    res.status(201).json(successResponse("Google Voice order created", result))
  })

  iHavePaid = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { orderId } = req.params
    const { proofOfPayment } = req.body
    const result = await this.googleVoiceService.iHavePaid(userId, orderId, proofOfPayment)
    res.status(200).json(successResponse("Payment confirmation received", result))
  })

  reportIssue = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { orderId } = req.params
    const result = await this.googleVoiceService.reportIssue(userId, orderId, req.body)
    res.status(200).json(successResponse("Issue reported successfully", result))
  })

  getOrder = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { orderId } = req.params
    const order = await this.googleVoiceService.getOrder(userId, orderId)
    res.status(200).json(successResponse("Order retrieved", order))
  })

  getUserOrders = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { status } = req.query
    const orders = await this.googleVoiceService.getUserOrders(userId, status as string)
    res.status(200).json(successResponse("Orders retrieved", orders))
  })

  checkDisputeWindow = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { orderId } = req.params
    const result = await this.googleVoiceService.checkDisputeWindow(orderId)
    res.status(200).json(successResponse("Dispute window status", result))
  })
}
