import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLE } from "../constants/statuses.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  paymentMethods: Array<{
    type: string;
    details: {
      momoNumber?: string;
      momoProvider?: string;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
    };
    verified: boolean;
    isPrimary: boolean;
  }>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ["momo", "bank"],
          required: true,
        },
        details: {
          momoNumber: String,
          momoProvider: String,
          bankName: String,
          accountNumber: String,
          accountName: String,
        },
        verified: {
          type: Boolean,
          default: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
