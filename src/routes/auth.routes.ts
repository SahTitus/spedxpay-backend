import { Router } from "express";
import { AuthController } from "../controllers/auth/auth.controller.js";
import { validation } from "../middlewares/common/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

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

router.post(
  "/change-password",
  authMiddleware,
  validation.validate({ body: changePasswordSchema }),
  authController.changePassword
);

router.get("/me", authMiddleware, authController.getMe);

export default router;
