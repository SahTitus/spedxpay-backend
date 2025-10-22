import mongoose, { Schema, type Document } from "mongoose"

export interface IGiftCardType extends Document {
  name: string
  code: string
  description?: string
  isActive: boolean
  icon?: string
  createdAt: Date
  updatedAt: Date
}

const GiftCardTypeSchema = new Schema<IGiftCardType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export const GiftCardType = mongoose.model<IGiftCardType>("GiftCardType", GiftCardTypeSchema)
