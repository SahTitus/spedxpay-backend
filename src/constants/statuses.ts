export const TRANSACTION_STATUS = {
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  PROCESSING: "processing",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  REJECTED: "rejected",
  DISPUTE: "dispute",
  EXPIRED: "expired",
  CRYPTO_RECEIVED: "crypto_received",
  PAYMENT_CONFIRMED: "payment_confirmed",
} as const

export const KYC_STATUS = {
  PENDING: "pending",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const

export const USER_ROLE = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  ASSISTANT_ADMIN: "assistant_admin",
} as const

export const PAYMENT_METHOD_TYPE = {
  MOMO: "momo",
  BANK: "bank",
  PAYSTACK: "paystack",
} as const

export const TRANSACTION_TYPE = {
  BUY_CRYPTO: "buy_crypto",
  SELL_CRYPTO: "sell_crypto",
  BUY_GIFT_CARD: "buy_gift_card",
  SELL_GIFT_CARD: "sell_gift_card",
  GOOGLE_VOICE: "google_voice",
} as const

export const KYC_LEVEL = {
  BASIC: "basic",
  ADVANCED: "advanced",
  BUSINESS: "business",
} as const

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]
export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS]
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE]
export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPE)[keyof typeof PAYMENT_METHOD_TYPE]
export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE]
export type KycLevel = (typeof KYC_LEVEL)[keyof typeof KYC_LEVEL]
