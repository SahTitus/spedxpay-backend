import { Router } from "express"
import { AdminController } from "@/controllers/admin/admin.controller"
import { AdminRoleController } from "@/controllers/admin/admin-role.controller"
import { validation } from "@/middlewares/common/validation.middleware"
import { authMiddleware } from "@/middlewares/auth/auth.middleware"
import { requireAdmin, requireSuperAdmin } from "@/middlewares/auth/permission.middleware"
import {
  reviewKycSchema,
  confirmPaymentSchema,
  completeTransactionSchema,
  rejectTransactionSchema,
  reviewGiftCardSchema,
  deliverGiftCardSchema,
  cancelBuyOrderSchema,
  deliverGoogleVoiceSchema,
  resolveDisputeSchema,
  updatePlatformConfigSchema,
  createGiftCardTypeSchema,
  updateGiftCardTypeSchema,
  assignRoleSchema,
  inviteAdminSchema,
} from "@/validators/admin.validator"

const router = Router()
const adminController = new AdminController();
const adminRoleController = new AdminRoleController();

// All admin routes require authentication and admin role
router.use(authMiddleware)
router.use(requireAdmin)

// KYC Management
router.get("/kyc/pending", adminController.getPendingKyc)
router.get("/kyc/all", adminController.getAllKycSubmissions)
router.get("/kyc/:kycId", adminController.getKycDetails)
router.post("/kyc/:kycId/review", validation.validate({ body: reviewKycSchema }), adminController.reviewKyc)

// Transaction Management
router.get("/transactions/pending", adminController.getPendingTransactions)
router.get("/transactions/:transactionId", adminController.getTransaction)
router.post(
  "/transactions/:transactionId/confirm-payment",
  validation.validate({ body: confirmPaymentSchema }),
  adminController.confirmPayment,
)
router.post(
  "/transactions/:transactionId/complete",
  validation.validate({ body: completeTransactionSchema }),
  adminController.completeTransaction,
)
router.post(
  "/transactions/:transactionId/reject",
  validation.validate({ body: rejectTransactionSchema }),
  adminController.rejectTransaction,
)

// Gift Card Management
router.get("/gift-cards/pending", adminController.getPendingGiftCards)
router.get("/gift-cards/sell-orders/pending", adminController.getPendingSellOrders)
router.get("/gift-cards/buy-orders/pending", adminController.getPendingBuyOrders)
router.post(
  "/gift-cards/:giftCardId/review",
  validation.validate({ body: reviewGiftCardSchema }),
  adminController.reviewGiftCard,
)
router.post("/gift-cards/:giftCardId/complete-sale", adminController.completeGiftCardSale)
router.post(
  "/gift-cards/:giftCardId/deliver",
  validation.validate({ body: deliverGiftCardSchema }),
  adminController.deliverGiftCardToBuyer,
)
router.post(
  "/gift-cards/:giftCardId/cancel",
  validation.validate({ body: cancelBuyOrderSchema }),
  adminController.cancelBuyOrder,
)

// Gift Card Type Management
router.post(
  "/gift-card-types",
  validation.validate({ body: createGiftCardTypeSchema }),
  adminController.createGiftCardType,
)
router.get("/gift-card-types", adminController.getAllGiftCardTypes)
router.get("/gift-card-types/:typeId", adminController.getGiftCardType)
router.put(
  "/gift-card-types/:typeId",
  validation.validate({ body: updateGiftCardTypeSchema }),
  adminController.updateGiftCardType,
)
router.delete("/gift-card-types/:typeId", adminController.deleteGiftCardType)

// Google Voice Management
router.get("/google-voice/pending", adminController.getPendingGoogleVoiceOrders)
router.post(
  "/google-voice/:orderId/deliver",
  validation.validate({ body: deliverGoogleVoiceSchema }),
  adminController.deliverGoogleVoiceOrder,
)
router.post(
  "/google-voice/:orderId/resolve-dispute",
  validation.validate({ body: resolveDisputeSchema }),
  adminController.resolveGoogleVoiceDispute,
)

// Platform Configuration
router.get("/config", adminController.getPlatformConfig)
router.put("/config", validation.validate({ body: updatePlatformConfigSchema }), adminController.updatePlatformConfig)

// Role Management
router.use("/roles", requireSuperAdmin)
router.get("/roles/users", adminRoleController.getAllUsers)
router.post(
  "/roles/users/:userId/assign",
  validation.validate({ body: assignRoleSchema }),
  adminRoleController.assignRole,
)
router.post("/roles/invite", validation.validate({ body: inviteAdminSchema }), adminRoleController.inviteAdmin)
router.get("/roles/invitations", adminRoleController.getPendingInvitations)
router.post("/roles/invitations/:invitationId/cancel", adminRoleController.cancelInvitation)
router.post( "/roles/invitations/:invitationId/resend", adminRoleController.resendInvitation )

export default router
