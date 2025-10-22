import mongoose, { Schema, type Document } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: string
  title: string
  message: string
  channels: string[]
  metadata?: Record<string, any>
  read: boolean
  sentAt: Date
  expiresAt: Date
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "kyc_approved",
        "kyc_rejected",
        "transaction_created",
        "transaction_completed",
        "transaction_rejected",
        "payment_received",
        "crypto_received",
        "admin_alert",
        "dispute_opened",
        "general",
        "role_change",
        "admin_invitation",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    channels: {
      type: [String],
      default: ["email"],
      enum: ["email", "sms"],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema)
