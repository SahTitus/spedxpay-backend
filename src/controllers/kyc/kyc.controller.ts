import type { Response, NextFunction } from "express"
import type { AuthRequest } from "@/middlewares/auth/auth.middleware"
import { KycService } from "@/services/kyc/kyc.service"
import { successResponse } from "@/utils/response-formatter"
import { asyncHandler } from "@/middlewares/common/error.middleware"

export class KycController {
  private kycService: KycService

  constructor() {
    this.kycService = new KycService()
  }

  submitKyc = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.kycService.submitKyc(userId, req.body)
    res.status(201).json(successResponse("KYC submitted successfully", result))
  })

  getKycStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.kycService.getKycStatus(userId)
    res.status(200).json(successResponse("KYC status retrieved successfully", result))
  })

  getKycHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.kycService.getKycHistory(userId)
    res.status(200).json(successResponse("KYC history retrieved successfully", result))
  })

  getKycDetails = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { submissionId } = req.params
    const result = await this.kycService.getKycDetails(userId, submissionId)
    res.status(200).json(successResponse("KYC details retrieved successfully", result))
  })
}
