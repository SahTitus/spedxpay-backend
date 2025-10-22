import { Router } from "express";
import { AuthController } from "@/controllers/auth/auth.controller";
import { validation } from "@/middlewares/common/validation.middleware";
import { authMiddleware } from "@/middlewares/auth/auth.middleware";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/validators/auth.validator";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validation.validate({ body: registerSchema }),
  authController.register
);

router.post(
  "/login",
  validation.validate({ body: loginSchema }),
  authController.login
);

router.post(
  "/verify-email",
  authMiddleware,
  validation.validate({ body: verifyEmailSchema }),
  authController.verifyEmail
);

router.post(
  "/request-password-reset",
  validation.validate({ body: requestPasswordResetSchema }),
  authController.requestPasswordReset
);

router.post(
  "/reset-password",
  validation.validate({ body: resetPasswordSchema }),
  authController.resetPassword
);

router.get("/me", authMiddleware, authController.getMe);

export default router;
