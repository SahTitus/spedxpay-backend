import { Router } from "express";
import { UserController } from "../controllers/user/user.controller";
import { validation } from "../middlewares/common/validation.middleware";
import { authMiddleware } from "../middlewares/auth/auth.middleware";
import {
  updateProfileSchema,
  addPaymentMethodSchema,
  paymentMethodIndexSchema,
  removePaymentMethodSchema,
} from "../validators/user.validator";

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authMiddleware);

router.get("/profile", userController.getProfile);

router.put(
  "/profile",
  validation.validate({ body: updateProfileSchema }),
  userController.updateProfile
);

router.post(
  "/payment-methods",
  validation.validate({ body: addPaymentMethodSchema }),
  userController.addPaymentMethod
);

router.post(
  "/payment-methods/verify",
  validation.validate({ body: paymentMethodIndexSchema }),
  userController.verifyPaymentMethod
);

router.post(
  "/payment-methods/set-primary",
  validation.validate({ body: paymentMethodIndexSchema }),
  userController.setPrimaryPaymentMethod
);

router.delete(
  "/payment-methods/:paymentMethodId",
  validation.validate({ params: removePaymentMethodSchema }),
  userController.removePaymentMethod,
)

export default router;
