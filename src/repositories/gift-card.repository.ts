import { BaseRepository } from "./base/base.repository"
import { GiftCard, type IGiftCard } from "@/models/GiftCard.model"

export class GiftCardRepository extends BaseRepository<IGiftCard> {
  constructor() {
    super(GiftCard)
  }

  async findBySellerId(sellerId: string, status?: string) {
    const filter: any = { sellerId }
    if (status) {
      filter.status = status
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec()
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

  async findAvailableForPurchase() {
    return this.model
      .find({
        status: "approved",
        buyerId: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec()
  }

  async findPendingSellOrders() {
    return this.model
      .find({
        sellerId: { $exists: true },
        status: { $in: ["pending", "under_review"] },
      })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .exec()
  }

  async findPendingBuyOrders() {
    return this.model
      .find({
        buyerId: { $exists: true },
        status: { $in: ["pending", "under_review"] },
      })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .exec()
  }

  async findPendingReview() {
    return this.model
      .find({
        status: { $in: ["pending", "under_review"] },
      })
      .populate("sellerId", "name email")
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .exec()
  }

  async updateStatus(giftCardId: string, status: string, additionalData?: any) {
    return this.model
      .findByIdAndUpdate(
        giftCardId,
        {
          status,
          ...additionalData,
        },
        { new: true },
      )
      .exec()
  }
}
