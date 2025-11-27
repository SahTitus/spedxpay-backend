import { RateRepository } from "../../repositories/rate.repository.js";
import { getRateProvider } from "../../integrations/rates/rates.config.js";
import { logger } from "../../utils/logger.js";

export class RatesService {
  private rateRepo: RateRepository;
  private rateProvider = getRateProvider();

  constructor() {
    this.rateRepo = new RateRepository();
  }

  async updateRates() {
    try {
      const rates = await this.rateProvider.fetchRates();

      for (const rate of rates) {
        await this.rateRepo.upsertRate(
          rate.cryptocurrency,
          rate.buyRate,
          rate.sellRate,
          rate.source,
          rate.metadata
        );

        logger.info(
          `Rate updated: ${rate.cryptocurrency} - Buy: ${rate.buyRate}, Sell: ${rate.sellRate}`
        );
      }

      return {
        success: true,
        updatedCount: rates.length,
        rates,
      };
    } catch (error) {
      logger.error("Update rates error:", error);
      throw error;
    }
  }

  async getRate(cryptocurrency: string) {
    const rate = await this.rateRepo.getLatestRate(cryptocurrency);

    if (!rate) {
      // If no rate in DB, fetch from provider
      logger.warn(
        `No rate found in DB for ${cryptocurrency}, fetching from provider`
      );
      const freshRate = await this.rateProvider.fetchRate(cryptocurrency);
      await this.rateRepo.upsertRate(
        freshRate.cryptocurrency,
        freshRate.buyRate,
        freshRate.sellRate,
        freshRate.source,
        freshRate.metadata
      );
      return freshRate;
    }

    return rate;
  }

  async getAllRates() {
    return this.rateRepo.getAllLatestRates();
  }
}
