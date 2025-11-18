import type { Response, NextFunction } from "express"
import { asyncHandler } from "@/middlewares/common/error.middleware"
import { TransactionService } from "@/services/transaction/transaction.service"
import { AuthRequest } from "@/middlewares/auth/auth.middleware"

export class TransactionController {
  private transactionService: TransactionService

  constructor() {
    this.transactionService = new TransactionService()
  }

  getUserTransactions = asyncHandler(async (req: AuthRequest<{ transactionId: string }>, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    const query = {
      type: req.query.type as "crypto" | "giftcard" | "googlevoice" | "all" | undefined,
      transactionType: req.query.transactionType as string,
      status: req.query.status as string,
      search: req.query.search as string,
      cardType: req.query.cardType as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      sort: req.query.sort as string,
    }

    const result = await this.transactionService.getUserTransactions(userId, query)

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    })
  })

  getTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
     const userId = req.user!.userId
    const { transactionId } = req.params

    const transaction = await this.transactionService.getTransaction(userId, transactionId)

    res.status(200).json({
      success: true,
      message: "Transaction retrieved successfully",
      data: transaction,
    })
  })

  getTransactionStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
     const userId = req.user!.userId

    const stats = await this.transactionService.getTransactionStats(userId)

    res.status(200).json({
      success: true,
      message: "Transaction stats retrieved successfully",
      data: stats,
    })
  } )
  
    cancelTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { transactionId } = req.params

    const result = await this.transactionService.cancelTransaction(userId, transactionId)

    res.status(200).json({
      success: true,
      message: "Transaction cancelled successfully",
      data: result,
    })
  })
}
