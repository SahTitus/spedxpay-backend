import mongoose, { Schema, type Document } from "mongoose";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../constants/statuses.js";
import { CRYPTO_CURRENCIES, FIAT_CURRENCIES } from "../constants/currencies.js";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  status: string;
  cryptocurrency?: string;
  fiatCurrency: string;
  amountCrypto?: number;
  amountFiat: number;
  rateUsed?: number;
  walletAddress?: string;
  platformWalletAddress?: string;
  blockchainTxHash?: string;
  paymentMethod: string;
  paymentDetails?: {
    momoNumber?: string;
    momoProvider?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  adapter: string;
  txRef: string;
  proofOfPayment?: string;
  proofOfSend?: string;
  termsAccepted: boolean;
  adminNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    cryptocurrency: {
      type: String,
      enum: Object.values(CRYPTO_CURRENCIES),
    },
    fiatCurrency: {
      type: String,
      enum: Object.values(FIAT_CURRENCIES),
      default: "ghs",
    },
    amountCrypto: {
      type: Number,
    },
    amountFiat: {
      type: Number,
      required: true,
    },
    rateUsed: {
      type: Number,
    },
    walletAddress: {
      type: String,
    },
    platformWalletAddress: {
      type: String,
    },
    blockchainTxHash: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["momo", "bank", "paystack"],
      required: true,
    },
    paymentDetails: {
      momoNumber: String,
      momoProvider: String,
      bankName: String,
      accountNumber: String,
      accountName: String,
    },
    adapter: {
      type: String,
      enum: ["manual", "paystack", "momo-sandbox"],
      default: "manual",
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    proofOfPayment: {
      type: String,
    },
    proofOfSend: {
      type: String,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    adminNotes: {
      type: String,
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
    expiresAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
