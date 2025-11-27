import { BaseRepository } from "./base/base.repository";
import { User, type IUser } from "../models/User.model.js";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select("+password").exec();
  }

  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return this.model
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      })
      .exec();
  }

  async findByResetPasswordToken(token: string): Promise<IUser | null> {
    return this.model
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .select("+password")
      .exec();
  }

  async addPaymentMethod(
    userId: string,
    paymentMethod: {
      type: string;
      details: any;
      verified: boolean;
      isPrimary: boolean;
    }
  ): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(
        userId,
        {
          $push: { paymentMethods: paymentMethod },
        },
        { new: true }
      )
      .exec();
  }

  async updatePaymentMethod(
    userId: string,
    methodIndex: number,
    updates: any
  ): Promise<IUser | null> {
    const updateQuery: any = {};
    Object.keys(updates).forEach((key) => {
      updateQuery[`paymentMethods.${methodIndex}.${key}`] = updates[key];
    });

    return this.model
      .findByIdAndUpdate(userId, updateQuery, { new: true })
      .exec();
  }

  async findByRole(role: string): Promise<IUser[]> {
    return this.model.find({ role }).exec();
  }

  async findAllWithPagination(
    skip: number,
    limit: number,
    filters: { role?: string },
    search?: string
  ): Promise<IUser[]> {
    const query: any = {};

    // Apply role filter
    if (filters.role) {
      query.role = filters.role;
    }

    // Apply search across name, email, and phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countWithFilters(
    filters: { role?: string },
    search?: string
  ): Promise<number> {
    const query: any = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    return this.model.countDocuments(query).exec();
  }

  async removePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(
        userId,
        {
          $pull: { paymentMethods: { _id: paymentMethodId } },
        },
        { new: true }
      )
      .exec();
  }
}
