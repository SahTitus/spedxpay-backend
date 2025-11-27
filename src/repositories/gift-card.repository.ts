import { BaseRepository } from "./base/base.repository";
import { GiftCard, type IGiftCard } from "../models/GiftCard.model.js";
import { User } from "../models/User.model.js";

export class GiftCardRepository extends BaseRepository<IGiftCard> {
  constructor() {
    super(GiftCard);
  }

  async findBySellerId(sellerId: string, status?: string) {
    const filter: any = { sellerId };
    if (status) {
      filter.status = status;
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByBuyerId(buyerId: string, status?: string) {
    const filter: any = { buyerId };
    if (status) {
      filter.status = status;
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByTxRef(txRef: string) {
    return this.model.findOne({ txRef }).exec();
  }

  async findAvailableForPurchase() {
    return this.model
      .find({
        status: "approved",
        buyerId: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingSellOrders() {
    return this.model
      .find({
        sellerId: { $exists: true },
        status: { $in: ["pending", "under_review"] },
      })
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingBuyOrders() {
    return this.model
      .find({
        buyerId: { $exists: true },
        status: { $in: ["pending", "under_review"] },
      })
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingReview() {
    return this.model
      .find({
        status: { $in: ["pending", "under_review"] },
      })
      .populate("sellerId", "name email phone")
      .populate("buyerId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(giftCardId: string, status: string, additionalData?: any) {
    return this.model
      .findByIdAndUpdate(
        giftCardId,
        {
          status,
          ...additionalData,
        },
        { new: true }
      )
      .exec();
  }

  async findAllWithFilters(
    skip = 0,
    limit = 20,
    filters: any = {},
    search?: string
  ) {
    const query: any = {};

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply type filter (sell or buy)
    if (filters.orderType === "sell") {
      query.sellerId = { $exists: true };
    } else if (filters.orderType === "buy") {
      query.buyerId = { $exists: true };
    }

    // Apply gift card type filter
    if (filters.type) {
      query.type = filters.type;
    }

    // Apply comprehensive search
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };

      // First, search for matching users (both sellers and buyers)
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((u) => u._id);

      // Build search query including user IDs and gift card fields
      query.$or = [
        { sellerId: { $in: userIds } },
        { buyerId: { $in: userIds } },
        { txRef: searchRegex },
        { type: searchRegex },
        { "cardDetails.pin": searchRegex },
        { "cardDetails.serial": searchRegex },
        { "paymentDetails.momoNumber": searchRegex },
        { "paymentDetails.accountNumber": searchRegex },
        { "paymentDetails.accountName": searchRegex },
        { "paymentDetails.bankName": searchRegex },
      ];
    }

    return this.model
      .find(query)
      .populate("sellerId", "name email phone")
      .populate("buyerId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countWithFilters(filters: any = {}, search?: string) {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.orderType === "sell") {
      query.sellerId = { $exists: true };
    } else if (filters.orderType === "buy") {
      query.buyerId = { $exists: true };
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };

      // Search for matching users
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      })
        .select("_id")
        .lean();

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { sellerId: { $in: userIds } },
        { buyerId: { $in: userIds } },
        { txRef: searchRegex },
        { type: searchRegex },
        { "cardDetails.pin": searchRegex },
        { "cardDetails.serial": searchRegex },
        { "paymentDetails.momoNumber": searchRegex },
        { "paymentDetails.accountNumber": searchRegex },
        { "paymentDetails.accountName": searchRegex },
        { "paymentDetails.bankName": searchRegex },
      ];
    }

    return this.model.countDocuments(query).exec();
  }
}
