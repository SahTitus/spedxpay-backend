import type { IRateProvider, RateData } from "./rate-provider.interface"
import { CRYPTO_CURRENCIES } from "@/constants/currencies"
import { logger } from "@/utils/logger"

export class CoinGeckoProvider implements IRateProvider {
  private apiKey: string
  private baseUrl = "https://api.coingecko.com/api/v3"

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ""
  }

  async fetchRates(): Promise<RateData[]> {
    try {
      const coinIds = {
        [CRYPTO_CURRENCIES.BTC]: "bitcoin",
        [CRYPTO_CURRENCIES.ETH]: "ethereum",
        [CRYPTO_CURRENCIES.USDT]: "tether",
        [CRYPTO_CURRENCIES.LTC]: "litecoin",
        [CRYPTO_CURRENCIES.XRP]: "ripple",
      }

      console.log("🪙🪙🪙CoinGeckoProvider")

      const ids = Object.values(coinIds).join(",")
      const url = `${this.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd`

      const response = await fetch(url, {
        headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : {},
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`)
      }

      const data = await response.json()

      const rates: RateData[] = []

      for (const [crypto, coinId] of Object.entries(coinIds)) {
        const price = data[coinId]?.usd
        if (price) {
          // Apply spread: buy rate is 2% higher, sell rate is 2% lower
          const buyRate = price * 1.02
          const sellRate = price * 0.98

          rates.push({
            cryptocurrency: crypto,
            buyRate,
            sellRate,
            source: "coingecko",
            metadata: {
              rawPrice: price,
              coinId,
            },
          })
        }
      }

      return rates
    } catch (error) {
      logger.error("CoinGecko fetch rates error:", error)
      throw error
    }
  }

  async fetchRate(cryptocurrency: string): Promise<RateData> {
    const rates = await this.fetchRates()
    const rate = rates.find((r) => r.cryptocurrency === cryptocurrency)

    if (!rate) {
      throw new Error(`Rate not found for ${cryptocurrency}`)
    }

    return rate
  }
}
