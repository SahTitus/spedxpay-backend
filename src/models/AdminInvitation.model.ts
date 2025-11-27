import mongoose, { Schema, type Document } from "mongoose"
import { USER_ROLE } from "../constants/statuses"

export interface IAdminInvitation extends Document {
  email: string
  role: string
  invitedBy: mongoose.Types.ObjectId
  token: string
  expiresAt: Date
  status: "pending" | "accepted" | "expired"
  createdAt: Date
  updatedAt: Date
}

const AdminInvitationSchema = new Schema<IAdminInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [USER_ROLE.ADMIN, USER_ROLE.ASSISTANT_ADMIN],
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

export const AdminInvitation = mongoose.model<IAdminInvitation>("AdminInvitation", AdminInvitationSchema)
