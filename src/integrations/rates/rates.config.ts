import { CoinGeckoProvider } from "./coingecko-provider"
import type { IRateProvider } from "./rate-provider.interface"
import { appConfig } from "@/config/app.config"

export interface RatesConfig {
  provider: string
  pollingIntervalMinutes: number
  cacheExpiryMinutes: number
}

export const ratesConfig: RatesConfig = {
  provider: "coingecko",
  pollingIntervalMinutes: 5,
  cacheExpiryMinutes: 10,
}

export function getRateProvider(): IRateProvider {
  switch (ratesConfig.provider) {
    case "coingecko":
      return new CoinGeckoProvider(appConfig.rates.coinGeckoApiKey)
    default:
      throw new Error(`Unknown rate provider: ${ratesConfig.provider}`)
  }
}
