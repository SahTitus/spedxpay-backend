import { Router } from "express"
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"
import kycRoutes from "./kyc.routes";
import cryptoTradingRoutes from "./crypto-trading.routes"
import giftCardRoutes from "./gift-card.routes"
import googleVoiceRoutes from "./google-voice.routes"
import ratesRoutes from "./rates.routes"
import adminRoutes from "./admin.routes"

const router = Router()

// API v1 routes
router.use("/auth", authRoutes)
router.use( "/users", userRoutes )
router.use("/kyc", kycRoutes)
router.use("/crypto", cryptoTradingRoutes)
router.use("/gift-cards", giftCardRoutes)
router.use("/google-voice", googleVoiceRoutes)
router.use("/rates", ratesRoutes)
router.use("/admin", adminRoutes)

export default router
