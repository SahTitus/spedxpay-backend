import { BaseRepository } from "./base/base.repository"
import { GoogleVoiceOrder, type IGoogleVoiceOrder } from "@/models/GoogleVoiceOrder.model"
import { User } from "@/models/User.model"

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

  async findAllWithFilters(skip = 0, limit = 20, filters: any = {}, search?: string) {
    const query: any = {}

    // Apply status filter
    if (filters.status) {
      query.status = filters.status
    }

    // Apply comprehensive search
    if (search) {
      const searchRegex = { $regex: search, $options: "i" }

      // First, search for matching users
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      })
        .select("_id")
        .lean()

      const userIds = matchingUsers.map((u) => u._id)

      // Build search query including user IDs and order fields
      query.$or = [
        { buyerId: { $in: userIds } },
        { txRef: searchRegex },
        { "accounts.accountEmail": searchRegex },
        { "accounts.phoneNumber": searchRegex },
        { "accounts.recoveryEmail": searchRegex },
      ]
    }

    return this.model
      .find(query)
      .populate("buyerId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec()
  }

  async countWithFilters(filters: any = {}, search?: string) {
    const query: any = {}

    if (filters.status) {
      query.status = filters.status
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" }

      // Search for matching users
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      })
        .select("_id")
        .lean()

      const userIds = matchingUsers.map((u) => u._id)

      query.$or = [
        { buyerId: { $in: userIds } },
        { txRef: searchRegex },
        { "accounts.accountEmail": searchRegex },
        { "accounts.phoneNumber": searchRegex },
        { "accounts.recoveryEmail": searchRegex },
      ]
    }

    return this.model.countDocuments(query).exec()
  }
}
