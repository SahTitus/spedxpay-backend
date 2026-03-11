export interface RateData {
  cryptocurrency: string
  buyRate: number
  sellRate: number
  source: string
  metadata?: Record<string, unknown>
}

export interface IRateProvider {
  fetchRates(): Promise<RateData[]>
  fetchRate(cryptocurrency: string): Promise<RateData>
}
