import type { Response, NextFunction } from "express"
import type { AuthRequest } from "../../middlewares/auth/auth.middleware"
import { UserService } from "../../services/user/user.service"
import { successResponse } from "../../utils/response-formatter"
import { asyncHandler } from "../../middlewares/common/error.middleware"

export class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const profile = await this.userService.getProfile(userId)
    res.status(200).json(successResponse("Profile retrieved successfully", profile))
  })

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.userService.updateProfile(userId, req.body)
    res.status(200).json(successResponse("Profile updated successfully", result))
  })

  addPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const result = await this.userService.addPaymentMethod(userId, req.body)
    res.status(201).json(successResponse("Payment method added successfully", result))
  })

  verifyPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { methodIndex } = req.body
    const result = await this.userService.verifyPaymentMethod(userId, methodIndex)
    res.status(200).json(successResponse("Payment method verified successfully", result))
  })

  setPrimaryPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { methodIndex } = req.body
    const result = await this.userService.setPrimaryPaymentMethod(userId, methodIndex)
    res.status(200).json(successResponse("Primary payment method updated successfully", result))
  } )
  
    removePaymentMethod = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { paymentMethodId } = req.params
    const result = await this.userService.removePaymentMethod(userId, paymentMethodId)
    res.status(200).json(successResponse("Payment method removed successfully", result))
  })
}
