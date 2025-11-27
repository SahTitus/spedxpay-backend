import { BaseRepository } from "./base/base.repository.js";
import { Transaction, type ITransaction } from "../models/Transaction.model.js";
import { GiftCard } from "../models/GiftCard.model.js";
import { GoogleVoiceOrder } from "../models/GoogleVoiceOrder.model.js";
import { User } from "../models/User.model.js";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../constants/statuses.js";

export class TransactionRepository extends BaseRepository<ITransaction> {
  constructor() {
    super(Transaction);
  }

  async findByUserId(userId: string, status?: string) {
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findByTxRef(txRef: string) {
    return this.model.findOne({ txRef }).exec();
  }

  async updateStatus(
    transactionId: string,
    status: string,
    additionalData?: any
  ) {
    return this.model
      .findByIdAndUpdate(
        transactionId,
        {
          status,
          ...additionalData,
        },
        { new: true }
      )
      .exec();
  }

  async findPendingTransactions() {
    return this.model
      .find({
        status: {
          $in: [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.UNDER_REVIEW],
        },
      })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findExpiredTransactions() {
    return this.model
      .find({
        status: TRANSACTION_STATUS.PENDING,
        expiresAt: { $lt: new Date() },
      })
      .exec();
  }

  async markExpired(transactionId: string) {
    return this.updateStatus(transactionId, TRANSACTION_STATUS.EXPIRED);
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

    // Apply type filter
    if (filters.type) {
      query.type = filters.type;
    }

    // Apply cryptocurrency filter
    if (filters.cryptocurrency) {
      query.cryptocurrency = filters.cryptocurrency;
    }

    // Apply comprehensive search
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };

      // First, search for matching users
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

      // Build search query including user IDs and transaction fields
      query.$or = [
        { userId: { $in: userIds } },
        { txRef: searchRegex },
        { walletAddress: searchRegex },
        { platformWalletAddress: searchRegex },
        { blockchainTxHash: searchRegex },
        { "paymentDetails.momoNumber": searchRegex },
        { "paymentDetails.accountNumber": searchRegex },
        { "paymentDetails.accountName": searchRegex },
        { "paymentDetails.bankName": searchRegex },
      ];
    }

    return this.model
      .find(query)
      .populate("userId", "name email phone")
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

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.cryptocurrency) {
      query.cryptocurrency = filters.cryptocurrency;
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
        { userId: { $in: userIds } },
        { txRef: searchRegex },
        { walletAddress: searchRegex },
        { platformWalletAddress: searchRegex },
        { blockchainTxHash: searchRegex },
        { "paymentDetails.momoNumber": searchRegex },
        { "paymentDetails.accountNumber": searchRegex },
        { "paymentDetails.accountName": searchRegex },
        { "paymentDetails.bankName": searchRegex },
      ];
    }

    return this.model.countDocuments(query).exec();
  }

  async findUserTransactionsWithPagination(params: {
    userId: string;
    type?: string; // 'crypto' | 'giftcard' | 'googlevoice' | 'all'
    transactionType?: string; // buy_crypto, sell_crypto, buy_gift_card, sell_gift_card, google_voice
    status?: string;
    search?: string;
    cardType?: string;
    page: number;
    limit: number;
    sort?: string;
  }) {
    const {
      userId,
      type,
      transactionType,
      status,
      search,
      cardType,
      page,
      limit,
      sort = "createdAt:desc",
    } = params;

    // Parse sort
    const [sortField, sortOrder] = sort.split(":");
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // First, search for matching users if search term is provided
    let userIds: any[] = [];
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      })
        .select("_id")
        .lean();
      userIds = matchingUsers.map((u) => u._id);
    }

    const allResults: any[] = [];

    // Query Transaction model (for crypto transactions)
    if (!type || type === "all" || type === "crypto") {
      const cryptoQuery: any = { userId };

      // Filter by transaction type
      if (transactionType) {
        cryptoQuery.type = transactionType;
      } else if (type === "crypto") {
        cryptoQuery.type = {
          $in: [TRANSACTION_TYPE.BUY_CRYPTO, TRANSACTION_TYPE.SELL_CRYPTO],
        };
      }

      // Filter by status
      if (status) {
        cryptoQuery.status = status;
      }

      // Apply search
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        cryptoQuery.$or = [
          { userId: { $in: userIds } },
          { txRef: searchRegex },
          { cryptocurrency: searchRegex },
          { walletAddress: searchRegex },
          { platformWalletAddress: searchRegex },
          { blockchainTxHash: searchRegex },
          { "paymentDetails.momoNumber": searchRegex },
          { "paymentDetails.accountNumber": searchRegex },
          { "paymentDetails.accountName": searchRegex },
          { "paymentDetails.bankName": searchRegex },
        ];
      }

      const cryptoTransactions = await Transaction.find(cryptoQuery)
        .populate("userId", "name email phone")
        .populate("reviewedBy", "name email")
        .lean()
        .exec();

      // Add source identifier
      cryptoTransactions.forEach((tx: any) => {
        tx.source = "crypto";
        allResults.push(tx);
      });
    }

    // Query GiftCard model (for gift card transactions)
    if (!type || type === "all" || type === "giftcard") {
      const giftCardQuery: any = {};

      // Gift cards can have sellerId or buyerId
      if (transactionType === TRANSACTION_TYPE.SELL_GIFT_CARD) {
        giftCardQuery.sellerId = userId;
      } else if (transactionType === TRANSACTION_TYPE.BUY_GIFT_CARD) {
        giftCardQuery.buyerId = userId;
      } else {
        // If no specific transaction type, get both sell and buy
        giftCardQuery.$or = [{ sellerId: userId }, { buyerId: userId }];
      }

      // Filter by status
      if (status) {
        giftCardQuery.status = status;
      }

      // Filter by card type
      if (cardType) {
        giftCardQuery.type = cardType;
      }

      // Apply search
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        const searchConditions = [
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

        if (giftCardQuery.$or) {
          // Combine with existing $or
          giftCardQuery.$and = [
            { $or: giftCardQuery.$or },
            { $or: searchConditions },
          ];
          delete giftCardQuery.$or;
        } else {
          giftCardQuery.$or = searchConditions;
        }
      }

      const giftCards = await GiftCard.find(giftCardQuery)
        .populate("sellerId", "name email phone")
        .populate("buyerId", "name email phone")
        .populate("reviewedBy", "name email")
        .lean()
        .exec();

      // Transform gift cards to match transaction format
      giftCards.forEach((gc: any) => {
        allResults.push({
          _id: gc._id,
          userId: gc.sellerId || gc.buyerId,
          type: gc.sellerId
            ? TRANSACTION_TYPE.SELL_GIFT_CARD
            : TRANSACTION_TYPE.BUY_GIFT_CARD,
          status: gc.status,
          amountFiat: gc.amountToReceive || gc.price || gc.faceValue,
          txRef: gc.txRef,
          paymentMethod: gc.paymentMethod,
          paymentDetails: gc.paymentDetails,
          reviewedBy: gc.reviewedBy,
          reviewedAt: gc.reviewedAt,
          completedAt: gc.completedAt,
          createdAt: gc.createdAt,
          updatedAt: gc.updatedAt,
          metadata: {
            cardType: gc.type,
            faceValue: gc.faceValue,
            cardForm: gc.cardForm,
            cardDetails: gc.cardDetails,
            photos: gc.photos,
            receiptPhoto: gc.receiptPhoto,
            rejectionReason: gc.rejectionReason,
          },
          source: "giftcard",
          // Include populated user data
          seller: gc.sellerId,
          buyer: gc.buyerId,
        });
      });
    }

    // Query GoogleVoiceOrder model (for Google Voice orders)
    if (!type || type === "all" || type === "googlevoice") {
      const googleVoiceQuery: any = { buyerId: userId };

      // Filter by status
      if (status) {
        googleVoiceQuery.status = status;
      }

      // Apply search
      if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        googleVoiceQuery.$or = [
          { buyerId: { $in: userIds } },
          { txRef: searchRegex },
          { "accounts.accountEmail": searchRegex },
          { "accounts.phoneNumber": searchRegex },
          { "accounts.recoveryEmail": searchRegex },
        ];
      }

      const googleVoiceOrders = await GoogleVoiceOrder.find(googleVoiceQuery)
        .populate("buyerId", "name email phone")
        .populate("reviewedBy", "name email")
        .lean()
        .exec();

      // Transform Google Voice orders to match transaction format
      googleVoiceOrders.forEach((gv: any) => {
        allResults.push({
          _id: gv._id,
          userId: gv.buyerId,
          type: TRANSACTION_TYPE.GOOGLE_VOICE,
          status: gv.status,
          amountFiat: gv.priceGhs,
          txRef: gv.txRef,
          paymentMethod: gv.paymentMethod,
          reviewedBy: gv.reviewedBy,
          reviewedAt: gv.reviewedAt,
          completedAt: gv.completedAt,
          createdAt: gv.createdAt,
          updatedAt: gv.updatedAt,
          metadata: {
            quantity: gv.quantity,
            priceUsd: gv.priceUsd,
            priceGhs: gv.priceGhs,
            accounts: gv.accounts,
            deliveredAt: gv.deliveredAt,
            expiresAt: gv.expiresAt,
            reportWindowMinutes: gv.reportWindowMinutes,
            disputeReason: gv.disputeReason,
            disputeReportedAt: gv.disputeReportedAt,
          },
          source: "googlevoice",
        });
      });
    }

    // Sort all results
    allResults.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === 1) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = allResults.length;
    const skip = (page - 1) * limit;
    const paginatedResults = allResults.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserTransactionStats(userId: string) {
    // Get crypto transaction stats
    const cryptoStats = await Transaction.aggregate([
      { $match: { userId: userId as any } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amountFiat" },
        },
      },
    ]);

    // Get gift card stats
    const giftCardSellStats = await GiftCard.aggregate([
      { $match: { sellerId: userId as any } },
      {
        $group: {
          _id: "sell_gift_card",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amountToReceive" },
        },
      },
    ]);

    const giftCardBuyStats = await GiftCard.aggregate([
      { $match: { buyerId: userId as any } },
      {
        $group: {
          _id: "buy_gift_card",
          count: { $sum: 1 },
          totalAmount: { $sum: "$price" },
        },
      },
    ]);

    // Get Google Voice stats
    const googleVoiceStats = await GoogleVoiceOrder.aggregate([
      { $match: { buyerId: userId as any } },
      {
        $group: {
          _id: "google_voice",
          count: { $sum: 1 },
          totalAmount: { $sum: "$priceGhs" },
        },
      },
    ]);

    // Combine all stats
    const byType = [
      ...cryptoStats,
      ...giftCardSellStats,
      ...giftCardBuyStats,
      ...googleVoiceStats,
    ];

    // Get status stats from all models
    const cryptoStatusStats = await Transaction.aggregate([
      { $match: { userId: userId as any } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const giftCardStatusStats = await GiftCard.aggregate([
      {
        $match: {
          $or: [{ sellerId: userId as any }, { buyerId: userId as any }],
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const googleVoiceStatusStats = await GoogleVoiceOrder.aggregate([
      { $match: { buyerId: userId as any } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Merge status stats
    const statusMap = new Map();
    [
      ...cryptoStatusStats,
      ...giftCardStatusStats,
      ...googleVoiceStatusStats,
    ].forEach((stat) => {
      const existing = statusMap.get(stat._id) || { _id: stat._id, count: 0 };
      existing.count += stat.count;
      statusMap.set(stat._id, existing);
    });

    const byStatus = Array.from(statusMap.values());

    return {
      byType,
      byStatus,
    };
  }
}
