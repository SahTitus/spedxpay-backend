import { connectDatabase } from "../config/database.config.js";
import { RatesService } from "../services/rates/rates.service.js";
import { logger } from "../utils/logger.js";

async function updateRates() {
  try {
    await connectDatabase();

    const ratesService = new RatesService();
    const result = await ratesService.updateRates();

    logger.info(`Rates updated: ${result.updatedCount} rates`);
    process.exit(0);
  } catch (error) {
    logger.error("Update rates error:", error);
    process.exit(1);
  }
}

updateRates();
