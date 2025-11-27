import { Router } from "express";
import { KycController } from "../controllers/kyc/kyc.controller.js";
import { validation } from "../middlewares/common/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth/auth.middleware.js";
import {
  submitKycSchema,
  submissionIdSchema,
} from "../validators/kyc.validator.js";

const router = Router();
const kycController = new KycController();

// All KYC routes require authentication
router.use(authMiddleware);

router.post(
  "/submit",
  validation.validate({ body: submitKycSchema }),
  kycController.submitKyc
);

router.get("/status", kycController.getKycStatus);

router.get("/history", kycController.getKycHistory);

router.get(
  "/:submissionId",
  validation.validate({ params: submissionIdSchema }),
  kycController.getKycDetails
);

export default router;
