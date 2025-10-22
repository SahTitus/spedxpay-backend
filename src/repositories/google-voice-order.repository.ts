import { BaseRepository } from "./base/base.repository"
import { GoogleVoiceOrder, type IGoogleVoiceOrder } from "@/models/GoogleVoiceOrder.model"

export class GoogleVoiceOrderRepository extends BaseRepository<IGoogleVoiceOrder> {
  constructor() {
    super(GoogleVoiceOrder)
  }

  async findByBuyerId(buyerId: string, status?: string) {
    const filter: any = { buyerId }
    if (status) {
      filter.status = status
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec()
  }

  async findByTxRef(txRef: string) {
    return this.model.findOne({ txRef }).exec()
  }

  async findPendingOrders() {
    return this.model
      .find({
        status: { $in: ["pending", "under_review"] },
      })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .exec()
  }

  async findExpiredDisputeWindows() {
    return this.model
      .find({
        status: "delivered",
        expiresAt: { $lt: new Date() },
      })
      .exec()
  }

  async updateStatus(orderId: string, status: string, additionalData?: any) {
    return this.model
      .findByIdAndUpdate(
        orderId,
        {
          status,
          ...additionalData,
        },
        { new: true },
      )
      .exec()
  }

  async findByIdWithPassword(orderId: string) {
    return this.model.findById(orderId).select("+encryptedPassword").exec()
  }
}
