import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import kycRoutes from "./kyc.routes.js";
import cryptoTradingRoutes from "./crypto-trading.routes.js";
import giftCardRoutes from "./gift-card.routes.js";
import googleVoiceRoutes from "./google-voice.routes.js";
import ratesRoutes from "./rates.routes.js";
import adminRoutes from "./admin.routes.js";
import transactionRoutes from "./transaction.routes.js";

const router = Router();

// API v1 routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/kyc", kycRoutes);
router.use("/crypto", cryptoTradingRoutes);
router.use("/gift-cards", giftCardRoutes);
router.use("/google-voice", googleVoiceRoutes);
router.use("/rates", ratesRoutes);
router.use("/admin", adminRoutes);
router.use("/transactions", transactionRoutes);

export default router;
