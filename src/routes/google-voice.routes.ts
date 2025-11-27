import { Router } from "express";
import { GoogleVoiceController } from "../controllers/google-voice/google-voice.controller.js";
import { validation } from "../middlewares/common/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth/auth.middleware.js";
import {
  createGoogleVoiceOrderSchema,
  reportIssueSchema,
  orderIdParamSchema,
} from "../validators/google-voice.validator.js";

const router = Router();
const googleVoiceController = new GoogleVoiceController();

// All routes require authentication
router.use(authMiddleware);

// Create order
router.post(
  "/orders",
  validation.validate({ body: createGoogleVoiceOrderSchema }),
  googleVoiceController.createOrder
);

// User action - "I Have Paid" button
router.post(
  "/orders/:orderId/i-have-paid",
  validation.validate({ params: orderIdParamSchema }),
  googleVoiceController.iHavePaid
);

// Report issue within 5-minute window
router.post(
  "/orders/:orderId/report-issue",
  validation.validate({ params: orderIdParamSchema, body: reportIssueSchema }),
  googleVoiceController.reportIssue
);

// Check dispute window status
router.get(
  "/orders/:orderId/dispute-window",
  validation.validate({ params: orderIdParamSchema }),
  googleVoiceController.checkDisputeWindow
);

// Get user's orders
router.get("/orders", googleVoiceController.getUserOrders);

// Get specific order
router.get(
  "/orders/:orderId",
  validation.validate({ params: orderIdParamSchema }),
  googleVoiceController.getOrder
);

export default router;
