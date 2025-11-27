import { Router } from "express";
import { CryptoTradingController } from "../controllers/crypto/crypto-trading.controller.js";
import { validation } from "../middlewares/common/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth/auth.middleware.js";
import {
  sellCryptoSchema,
  buyCryptoSchema,
  transactionIdParamSchema,
} from "../validators/crypto-trading.validator.js";

const router = Router();
const cryptoTradingController = new CryptoTradingController();

// All routes require authentication
router.use(authMiddleware);

// Create transactions
router.post(
  "/sell",
  validation.validate({ body: sellCryptoSchema }),
  cryptoTradingController.sellCrypto
);

router.post(
  "/buy",
  validation.validate({ body: buyCryptoSchema }),
  cryptoTradingController.buyCrypto
);

// User actions - CRITICAL BUTTONS
router.post(
  "/:transactionId/i-have-sent",
  validation.validate({ params: transactionIdParamSchema }),
  cryptoTradingController.iHaveSent
);

router.post(
  "/:transactionId/i-have-paid",
  validation.validate({ params: transactionIdParamSchema }),
  cryptoTradingController.iHavePaid
);

// Get transactions
router.get("/transactions", cryptoTradingController.getUserTransactions);

router.get(
  "/transactions/:transactionId",
  validation.validate({ params: transactionIdParamSchema }),
  cryptoTradingController.getTransaction
);

// Platform info
router.get("/platform/wallets", cryptoTradingController.getPlatformWallets);

router.get(
  "/platform/payment-details",
  cryptoTradingController.getPlatformPaymentDetails
);

export default router;
