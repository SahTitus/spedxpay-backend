import mongoose, { Schema, type Document } from "mongoose"

export interface IPlatformConfig extends Document {
  key: string
  value: any
  description?: string
  updatedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PlatformConfigSchema = new Schema<IPlatformConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

export const PlatformConfig = mongoose.model<IPlatformConfig>("PlatformConfig", PlatformConfigSchema)
