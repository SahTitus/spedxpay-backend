import mongoose, { Schema, type Document } from "mongoose"
import { GIFT_CARD_TYPES } from "../constants/currencies"

export interface IGiftCard extends Document {
  sellerId?: mongoose.Types.ObjectId
  buyerId?: mongoose.Types.ObjectId
  type: string
  faceValue: number
  price?: number
  amountToReceive?: number
  cardForm: "electronic" | "physical"
  cardDetails?: {
    pin?: string
    serial?: string
  }
  photos?: {
    front?: string
    back?: string
  }
  receiptPhoto?: string
  status: string
  paymentMethod?: string
  paymentDetails?: {
    momoNumber?: string
    momoProvider?: string
    bankName?: string
    accountNumber?: string
    accountName?: string
  }
  txRef: string
  reviewedBy?: mongoose.Types.ObjectId
  reviewedAt?: Date
  rejectionReason?: string
  completedAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const GiftCardSchema = new Schema<IGiftCard>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(GIFT_CARD_TYPES),
      required: true,
      index: true,
    },
    faceValue: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
    },
    amountToReceive: {
      type: Number,
    },
    cardForm: {
      type: String,
      enum: ["electronic", "physical"],
      required: true,
    },
    cardDetails: {
      pin: String,
      serial: String,
    },
    photos: {
      front: String,
      back: String,
    },
    receiptPhoto: String,
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "completed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "bank", "paystack"],
    },
    paymentDetails: {
      momoNumber: String,
      momoProvider: String,
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    rejectionReason: String,
    completedAt: Date,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
)

export const GiftCard = mongoose.model<IGiftCard>("GiftCard", GiftCardSchema)
