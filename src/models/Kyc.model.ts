import mongoose, { Schema, type Document } from "mongoose"
import { KYC_STATUS, KYC_LEVEL } from "@/constants/statuses"

export interface IKyc extends Document {
  userId: mongoose.Types.ObjectId
  submissionId: string
  level: string
  status: string
  documents: {
    idDocument: string
    selfieDocument: string
    proofOfAddress?: string
  }
  rejectionReason?: string
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: mongoose.Types.ObjectId
  expiresAt?: Date
  version: number
  metadata?: {
    ipAddress?: string
    userAgent?: string
  }
  createdAt: Date
  updatedAt: Date
}

const KycSchema = new Schema<IKyc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    submissionId: {
      type: String,
      required: true,
      unique: true,
    },
    level: {
      type: String,
      enum: Object.values(KYC_LEVEL),
      default: KYC_LEVEL.BASIC,
    },
    status: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.PENDING,
      index: true,
    },
    documents: {
      idDocument: {
        type: String,
        required: true,
      },
      selfieDocument: {
        type: String,
        required: true,
      },
      proofOfAddress: String,
    },
    rejectionReason: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: Date,
    version: {
      type: Number,
      default: 1,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster queries
KycSchema.index({ userId: 1, status: 1 })
KycSchema.index({ submittedAt: -1 })
KycSchema.index({ status: 1, submittedAt: -1 })

export const Kyc = mongoose.model<IKyc>("Kyc", KycSchema)
