import mongoose, { Schema, type Document } from "mongoose"
import { CRYPTO_CURRENCIES } from "../constants/currencies"

export interface IRate extends Document {
  cryptocurrency: string
  buyRate: number
  sellRate: number
  source: string
  lastUpdated: Date
  metadata?: Record<string, any>
  createdAt: Date
}

const RateSchema = new Schema<IRate>(
  {
    cryptocurrency: {
      type: String,
      enum: Object.values(CRYPTO_CURRENCIES),
      required: true,
      index: true,
    },
    buyRate: {
      type: Number,
      required: true,
    },
    sellRate: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
RateSchema.index({ cryptocurrency: 1, lastUpdated: -1 })

export const Rate = mongoose.model<IRate>("Rate", RateSchema)
