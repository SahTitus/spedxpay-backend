export interface RateData {
  cryptocurrency: string
  buyRate: number
  sellRate: number
  source: string
  metadata?: Record<string, any>
}

export interface IRateProvider {
  fetchRates(): Promise<RateData[]>
  fetchRate(cryptocurrency: string): Promise<RateData>
}
