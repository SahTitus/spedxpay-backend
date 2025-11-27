import type { Request, Response, NextFunction } from "express";
import { RatesService } from "../../services/rates/rates.service.js";
import { successResponse } from "../../utils/response-formatter.js";
import { asyncHandler } from "../../middlewares/common/error.middleware.js";

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
    }
  );

  getRate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { cryptocurrency } = req.params;
      const rate = await this.ratesService.getRate(cryptocurrency);
      res
        .status(200)
        .json(successResponse("Rate retrieved successfully", rate));
    }
  );

  updateRates = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await this.ratesService.updateRates();
      res
        .status(200)
        .json(successResponse("Rates updated successfully", result));
    }
  );
}
