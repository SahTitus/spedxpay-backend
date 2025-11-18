import { Router } from "express"
import { TransactionController } from "@/controllers/transaction/transaction.controller"
import { validation } from "@/middlewares/common/validation.middleware"
import { authMiddleware } from "@/middlewares/auth/auth.middleware"
import { getTransactionsQuerySchema, transactionIdParamSchema } from "@/validators/transaction.validator"

const router = Router()
const transactionController = new TransactionController()

router.use(authMiddleware)

// GET /api/v1/transactions - Get all user transactions with filtering
router.get("/", validation.validate({ query: getTransactionsQuerySchema }), transactionController.getUserTransactions)

// GET /api/v1/transactions/stats - Get user transaction statistics
router.get("/stats", transactionController.getTransactionStats)

// GET /api/v1/transactions/:transactionId - Get single transaction
router.get(
  "/:transactionId",
  validation.validate({ params: transactionIdParamSchema }),
  transactionController.getTransaction,
)

// POST /api/v1/transactions/:transactionId/cancel - Cancel a transaction
router.post(
  "/:transactionId/cancel",
  validation.validate({ params: transactionIdParamSchema }),
  transactionController.cancelTransaction,
)

export default router
