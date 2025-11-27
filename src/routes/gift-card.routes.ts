import { Router } from "express"
import { GiftCardController } from "../controllers/gift-card/gift-card.controller"
import { validation } from "../middlewares/common/validation.middleware"
import { authMiddleware } from "../middlewares/auth/auth.middleware"
import {
  sellGiftCardSchema,
  buyGiftCardSchema,
  giftCardIdParamSchema,
} from "../validators/gift-card.validator"

const router = Router()
const giftCardController = new GiftCardController()

router.get("/types", giftCardController.getAvailableTypes)

// All routes require authentication
router.use(authMiddleware)

// Sell gift card
router.post("/sell", validation.validate({ body: sellGiftCardSchema }), giftCardController.sellGiftCard)

// Get available gift cards for purchase
router.get("/available", giftCardController.getAvailableTypes)

// Buy gift card
router.post( "/buy", validation.validate( { body: buyGiftCardSchema } ), giftCardController.buyGiftCard )

// User action - "I Have Sent" button
router.post(
  "/:giftCardId/i-have-sent",
  validation.validate({ params: giftCardIdParamSchema }),
  giftCardController.iHaveSentGiftCard,
)


// User action - "I Have Paid" button
router.post(
  "/:giftCardId/i-have-paid",
  validation.validate({ params: giftCardIdParamSchema }),
  giftCardController.iHavePaidForGiftCard,
)

// Get user's sold gift cards
router.get("/sold", giftCardController.getUserSoldGiftCards)

// Get user's purchased gift cards
router.get("/purchased", giftCardController.getUserPurchasedGiftCards)

// Get specific gift card
router.get("/:giftCardId", validation.validate({ params: giftCardIdParamSchema }), giftCardController.getGiftCard)

export default router
