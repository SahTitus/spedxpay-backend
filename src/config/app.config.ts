import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "5000", 10),
  apiVersion: process.env.API_VERSION || "v1",
  appName: "SpedXpay",

  database: {
    uri:
      process.env.MONGODB_URI || "mongodb://localhost:27017/sped_x_pay-backend",
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    jwtExpire: process.env.JWT_EXPIRE || "1h" as string | number,
    encryptionKey:
      process.env.ENCRYPTION_KEY || "your-32-character-encryption-key",
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromEmail: "onboarding@resend.dev",
    fromName: "SpedXpay Platform",
  },

  payment: {
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY || "",
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    },
    mtnMomo: {
      subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY || "",
      apiUser: process.env.MTN_MOMO_API_USER || "",
      apiKey: process.env.MTN_MOMO_API_KEY || "",
      environment: process.env.MTN_MOMO_ENVIRONMENT || "sandbox",
    },
  },

  storage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      apiKey: process.env.CLOUDINARY_API_KEY || "",
      apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      region: process.env.AWS_REGION || "us-east-1",
      bucket: process.env.AWS_S3_BUCKET || "",
    },
  },

  rates: {
    coinGeckoApiKey: process.env.COINGECKO_API_KEY || "",
  },

  admin: {
    email: process.env.ADMIN_EMAIL || "admin@sped_x_pay.com",
    password: process.env.ADMIN_PASSWORD || "change-this-password",
  },

  platform: {
    wallets: {
      btc: process.env.PLATFORM_BTC_WALLET || "",
      eth: process.env.PLATFORM_ETH_WALLET || "",
      usdt: process.env.PLATFORM_USDT_WALLET || "",
      ltc: process.env.PLATFORM_LTC_WALLET || "",
      xrp: process.env.PLATFORM_XRP_WALLET || "",
    },
    momo: {
      number: process.env.PLATFORM_MOMO_NUMBER || "",
    },
    bank: {
      name: process.env.PLATFORM_BANK_NAME || "",
      accountNumber: process.env.PLATFORM_BANK_ACCOUNT || "",
      accountName: process.env.PLATFORM_BANK_ACCOUNT_NAME || "",
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
} as const;

export type AppConfig = typeof appConfig;
