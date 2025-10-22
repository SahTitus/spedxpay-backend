import { BaseRepository } from "./base/base.repository"
import { User, type IUser } from "@/models/User.model"

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select("+password").exec()
  }

  async findByEmailVerificationToken(token: string): Promise<IUser | null> {
    return this.model
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      })
      .exec()
  }

  async findByResetPasswordToken(token: string): Promise<IUser | null> {
    return this.model
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .select("+password")
      .exec()
  }

  async addPaymentMethod(
    userId: string,
    paymentMethod: {
      type: string
      details: any
      verified: boolean
      isPrimary: boolean
    },
  ): Promise<IUser | null> {
    return this.model
      .findByIdAndUpdate(
        userId,
        {
          $push: { paymentMethods: paymentMethod },
        },
        { new: true },
      )
      .exec()
  }

  async updatePaymentMethod(userId: string, methodIndex: number, updates: any): Promise<IUser | null> {
    const updateQuery: any = {}
    Object.keys(updates).forEach((key) => {
      updateQuery[`paymentMethods.${methodIndex}.${key}`] = updates[key]
    })

    return this.model.findByIdAndUpdate(userId, updateQuery, { new: true }).exec()
  }

  async findByRole( role: string ): Promise<IUser[]> {
    return this.model.find( { role } ).exec()
  }
}
