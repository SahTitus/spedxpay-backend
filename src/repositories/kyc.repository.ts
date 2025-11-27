import { BaseRepository } from "./base/base.repository.js";
import { Kyc, type IKyc } from "../models/Kyc.model.js";
import { KYC_STATUS } from "../constants/statuses.js";
import { User } from "../models/User.model.js";

export class KycRepository extends BaseRepository<IKyc> {
  constructor() {
    super(Kyc);
  }

  async findByUserId(userId: string): Promise<IKyc[]> {
    return this.model.find({ userId }).sort({ submittedAt: -1 }).exec();
  }

  async findLatestByUserId(userId: string): Promise<IKyc | null> {
    return this.model.findOne({ userId }).sort({ submittedAt: -1 }).exec();
  }

  async getCurrentKyc(userId: string): Promise<IKyc | null> {
    return this.model.findOne({ userId }).sort({ submittedAt: -1 }).exec();
  }

  async findApprovedByUserId(userId: string): Promise<IKyc | null> {
    return this.model
      .findOne({
        userId,
        status: KYC_STATUS.APPROVED,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .sort({ submittedAt: -1 })
      .exec();
  }

  async findBySubmissionId(submissionId: string): Promise<IKyc | null> {
    return this.model.findOne({ submissionId }).exec();
  }

  async findPendingSubmissions(): Promise<IKyc[]> {
    return this.model
      .find({ status: { $in: [KYC_STATUS.PENDING, KYC_STATUS.UNDER_REVIEW] } })
      .populate("userId", "name email phone")
      .sort({ submittedAt: 1 })
      .exec();
  }

  async findAll(skip = 0, limit = 20): Promise<IKyc[]> {
    return this.model
      .find()
      .populate("userId", "name email phone")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async updateStatus(
    submissionId: string,
    status: string,
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<IKyc | null> {
    return this.model
      .findOneAndUpdate(
        { submissionId },
        {
          status,
          reviewedAt: new Date(),
          reviewedBy,
          ...(rejectionReason && { rejectionReason }),
          ...(status === KYC_STATUS.APPROVED && {
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          }), // 1 year expiry
        },
        { new: true }
      )
      .exec();
  }

  async getSubmissionHistory(userId: string): Promise<IKyc[]> {
    return this.model
      .find({ userId })
      .populate("reviewedBy", "name email")
      .sort({ submittedAt: -1 })
      .exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.model.countDocuments({ status }).exec();
  }

  async findExpiredKyc(): Promise<IKyc[]> {
    return this.model
      .find({
        status: KYC_STATUS.APPROVED,
        expiresAt: { $lt: new Date() },
      })
      .exec();
  }

  async findAllWithPagination(
    skip: number,
    limit: number,
    filters: { status?: string },
    search?: string
  ): Promise<IKyc[]> {
    const query: any = {};

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
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

      // Build search query including user IDs and KYC fields
      query.$or = [
        { userId: { $in: userIds } },
        { submissionId: searchRegex },
        { documentNumber: searchRegex },
        { address: searchRegex },
      ];
    }

    return this.model
      .find(query)
      .populate("userId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countWithFilters(
    filters: { status?: string },
    search?: string
  ): Promise<number> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
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
        { submissionId: searchRegex },
        { documentNumber: searchRegex },
        { address: searchRegex },
      ];
    }

    return this.model.countDocuments(query).exec();
  }
}
