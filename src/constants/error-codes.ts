export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: "invalid_credentials",
  USER_NOT_FOUND: "user_not_found",
  USER_ALREADY_EXISTS: "user_already_exists",
  EMAIL_NOT_VERIFIED: "email_not_verified",
  INVALID_TOKEN: "invalid_token",
  TOKEN_EXPIRED: "token_expired",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",

  // Validation
  VALIDATION_ERROR: "validation_error",
  INVALID_INPUT: "invalid_input",
  MISSING_REQUIRED_FIELD: "missing_required_field",

    // Admin & Roles
  INVITATION_NOT_FOUND: "invitation_not_found",
  INVITATION_ALREADY_EXISTS: "invitation_already_exists",
  INVITATION_EXPIRED: "invitation_expired",

  // KYC
  KYC_NOT_APPROVED: "kyc_not_approved",
  KYC_ALREADY_SUBMITTED: "kyc_already_submitted",
  KYC_REJECTED: "kyc_rejected",
  KYC_ALREADY_APPROVED: "kyc_already_approved",
  KYC_NOT_FOUND: "kyc_not_found",

  // Transactions
  TRANSACTION_NOT_FOUND: "transaction_not_found",
  TRANSACTION_EXPIRED: "transaction_expired",
  TRANSACTION_ALREADY_COMPLETED: "transaction_already_completed",
  INSUFFICIENT_BALANCE: "insufficient_balance",
  INVALID_AMOUNT: "invalid_amount",
  INVALID_WALLET_ADDRESS: "invalid_wallet_address",

  // Payment
  PAYMENT_FAILED: "payment_failed",
  PAYMENT_METHOD_NOT_FOUND: "payment_method_not_found",
  PAYMENT_METHOD_NOT_VERIFIED: "payment_method_not_verified",

  // Gift Cards
  GIFT_CARD_NOT_FOUND: "gift_card_not_found",
  GIFT_CARD_ALREADY_SOLD: "gift_card_already_sold",
  INVALID_GIFT_CARD: "invalid_gift_card",
  DUPLICATE_ENTRY: "duplicate_entry",
  GIFT_CARD_ALREADY_EXISTS: "gift_card_already_exists",

  // Google Voice
  GOOGLE_VOICE_ORDER_NOT_FOUND: "google_voice_order_not_found",
  DISPUTE_WINDOW_EXPIRED: "dispute_window_expired",

  // General
  INTERNAL_SERVER_ERROR: "internal_server_error",
  INTERNAL_ERROR: "internal_server_error",
  NOT_FOUND: "not_found",
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
} as const

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",
  [ERROR_CODES.USER_NOT_FOUND]: "User not found",
  [ERROR_CODES.USER_ALREADY_EXISTS]: "User already exists with this email",
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: "Please verify your email before proceeding",
  [ERROR_CODES.INVALID_TOKEN]: "Invalid or malformed token",
  [ERROR_CODES.TOKEN_EXPIRED]: "Token has expired",
  [ERROR_CODES.UNAUTHORIZED]: "You are not authorized to perform this action",
  [ERROR_CODES.FORBIDDEN]: "Access forbidden",
  [ERROR_CODES.VALIDATION_ERROR]: "Validation failed",
  [ERROR_CODES.INVALID_INPUT]: "Invalid input provided",
  [ ERROR_CODES.MISSING_REQUIRED_FIELD ]: "Required field is missing",
  [ERROR_CODES.INVITATION_NOT_FOUND]: "Invitation not found",
  [ERROR_CODES.INVITATION_ALREADY_EXISTS]: "Invitation already exists for this email",
  [ERROR_CODES.INVITATION_EXPIRED]: "Invitation has expired",
  [ERROR_CODES.KYC_NOT_APPROVED]: "KYC verification is required to perform this action",
  [ERROR_CODES.KYC_ALREADY_SUBMITTED]: "KYC has already been submitted",
  [ERROR_CODES.KYC_REJECTED]: "Your KYC was rejected",
  [ERROR_CODES.KYC_ALREADY_APPROVED]: "KYC has already been approved",
  [ERROR_CODES.KYC_NOT_FOUND]: "KYC submission not found",
  [ERROR_CODES.TRANSACTION_NOT_FOUND]: "Transaction not found",
  [ERROR_CODES.TRANSACTION_EXPIRED]: "Transaction has expired",
  [ERROR_CODES.TRANSACTION_ALREADY_COMPLETED]: "Transaction is already completed",
  [ERROR_CODES.INSUFFICIENT_BALANCE]: "Insufficient balance",
  [ERROR_CODES.INVALID_AMOUNT]: "Invalid amount",
  [ERROR_CODES.INVALID_WALLET_ADDRESS]: "Invalid wallet address",
  [ERROR_CODES.PAYMENT_FAILED]: "Payment failed",
  [ERROR_CODES.PAYMENT_METHOD_NOT_FOUND]: "Payment method not found",
  [ERROR_CODES.PAYMENT_METHOD_NOT_VERIFIED]: "Payment method not verified",
  [ERROR_CODES.GIFT_CARD_NOT_FOUND]: "Gift card not found",
  [ERROR_CODES.GIFT_CARD_ALREADY_SOLD]: "Gift card has already been sold",
  [ERROR_CODES.INVALID_GIFT_CARD]: "Invalid gift card",
  [ ERROR_CODES.GIFT_CARD_ALREADY_EXISTS ]: "Gift card type already exists",
  [ERROR_CODES.DUPLICATE_ENTRY]: "A record with this information already exists",
  [ERROR_CODES.GOOGLE_VOICE_ORDER_NOT_FOUND]: "Google Voice order not found",
  [ERROR_CODES.DISPUTE_WINDOW_EXPIRED]: "Dispute window has expired",
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "Internal server error",
  [ERROR_CODES.NOT_FOUND]: "Resource not found",
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: "Rate limit exceeded",
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
