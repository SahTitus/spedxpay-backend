import mongoose, { Schema, type Document } from "mongoose"
import type { DateExpressionOperator} from "mongoose"
import { decrypt } from "../utils/encryption"

export interface IAccountDetails {
  accountEmail: string
  phoneNumber: string
  recoveryEmail: string
  encryptedPassword: string
}

export interface IGoogleVoiceOrder extends Document {
  buyerId: mongoose.Types.ObjectId
  quantity: number
  accounts: IAccountDetails[]
  priceUsd: number
  priceGhs: number
  status: string
  paymentMethod: string
  txRef: string
  deliveredAt?: Date
  expiresAt?: Date
  reportWindowMinutes: number
  disputeReason?: string
  disputeReportedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  completedAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: DateExpressionOperator
  getDecryptedPasswords(): Array<{ accountEmail: string; password: string }>
}

const AccountDetailsSchema = new Schema<IAccountDetails>(
  {
    accountEmail: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      required: true,
    },
    encryptedPassword: {
      type: String,
      required: true,
      select: false,
    },
  },
  { _id: false },
)

const GoogleVoiceOrderSchema = new Schema<IGoogleVoiceOrder>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    accounts: {
      type: [AccountDetailsSchema],
      default: [],
    },
    priceUsd: {
      type: Number,
      required: true,
    },
    priceGhs: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "delivered", "completed", "dispute", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "bank", "paystack"],
      required: true,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    reportWindowMinutes: {
      type: Number,
      default: 5,
    },
    disputeReason: {
      type: String,
    },
    disputeReportedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

GoogleVoiceOrderSchema.methods.getDecryptedPasswords = function (): Array<{
  accountEmail: string
  password: string
}> {
  return this.accounts.map((account: IAccountDetails) => ({
    accountEmail: account.accountEmail,
    password: decrypt(account.encryptedPassword),
  }))
}

export const GoogleVoiceOrder = mongoose.model<IGoogleVoiceOrder>("GoogleVoiceOrder", GoogleVoiceOrderSchema)
