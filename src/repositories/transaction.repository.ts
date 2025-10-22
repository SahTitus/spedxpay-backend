import { BaseRepository } from "./base/base.repository"
import { Transaction, type ITransaction } from "@/models/Transaction.model"
import { TRANSACTION_STATUS } from "@/constants/statuses"

export class TransactionRepository extends BaseRepository<ITransaction> {
  constructor() {
    super(Transaction)
  }

  async findByUserId(userId: string, status?: string) {
    const filter: any = { userId }
    if (status) {
      filter.status = status
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec()
  }

  async findByTxRef(txRef: string) {
    return this.model.findOne({ txRef }).exec()
  }

  async updateStatus(transactionId: string, status: string, additionalData?: any) {
    return this.model
      .findByIdAndUpdate(
        transactionId,
        {
          status,
          ...additionalData,
        },
        { new: true },
      )
      .exec()
  }

  async findPendingTransactions() {
    return this.model
      .find({
        status: { $in: [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.UNDER_REVIEW] },
      })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .exec()
  }

  async findExpiredTransactions() {
    return this.model
      .find({
        status: TRANSACTION_STATUS.PENDING,
        expiresAt: { $lt: new Date() },
      })
      .exec()
  }

  async markExpired(transactionId: string) {
    return this.updateStatus(transactionId, TRANSACTION_STATUS.EXPIRED)
  }
}
