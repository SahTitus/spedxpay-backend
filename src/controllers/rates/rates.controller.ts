import type { Request, Response, NextFunction } from "express";
import { RatesService } from "../../services/rates/rates.service.js";
import { successResponse } from "../../utils/response-formatter.js";
import {
  asyncHandler,
  createError,
} from "../../middlewares/common/error.middleware.js";
import { ERROR_CODES } from "../../constants/error-codes.js";

export class RatesController {
  private ratesService: RatesService;

  constructor() {
    this.ratesService = new RatesService();
  }

  getAllRates = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const rates = await this.ratesService.getAllRates();
      res
        .status(200)
        .json(successResponse("Rates retrieved successfully", rates));
    },
  );

  getRate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const rawCrypto = req.params.cryptocurrency;
      const cryptocurrency =
        typeof rawCrypto === "string"
          ? rawCrypto
          : Array.isArray(rawCrypto)
            ? rawCrypto[0]
            : undefined;

      if (!cryptocurrency) {
        throw createError(
          "Cryptocurrency is required",
          400,
          ERROR_CODES.MISSING_REQUIRED_FIELD,
        );
      }

      const rate = await this.ratesService.getRate(cryptocurrency);
      res
        .status(200)
        .json(successResponse("Rate retrieved successfully", rate));
    },
  );

  updateRates = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.ratesService.updateRates();
      res
        .status(200)
        .json(successResponse("Rates updated successfully", result));
    },
  );
}
