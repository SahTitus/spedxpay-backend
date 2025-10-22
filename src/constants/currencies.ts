export const CRYPTO_CURRENCIES = {
  BTC: "btc",
  ETH: "ethereum",
  USDT: "usdt",
  LTC: "litecoin",
  XRP: "xrp",
} as const

export const FIAT_CURRENCIES = {
  USD: "usd",
  GHS: "ghs",
} as const

export const GIFT_CARD_TYPES = {
  APPLE: "apple",
  VANILLA: "vanilla",
  MASTER: "master",
  VISA: "visa",
  WALMART: "walmart",
  PAYPAL: "paypal",
  TARGET: "target",
  BESTBUY: "bestbuy",
  OTHERS: "others",
} as const

export type CryptoCurrency = (typeof CRYPTO_CURRENCIES)[keyof typeof CRYPTO_CURRENCIES]
export type FiatCurrency = (typeof FIAT_CURRENCIES)[keyof typeof FIAT_CURRENCIES]
export type GiftCardType = (typeof GIFT_CARD_TYPES)[keyof typeof GIFT_CARD_TYPES]
