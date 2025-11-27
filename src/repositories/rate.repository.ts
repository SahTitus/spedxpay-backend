import { BaseRepository } from "./base/base.repository"
import { Rate, type IRate } from "../models/Rate.model"

export class RateRepository extends BaseRepository<IRate> {
  constructor() {
    super(Rate)
  }

  async getLatestRate(cryptocurrency: string) {
    return this.model.findOne({ cryptocurrency }).sort({ lastUpdated: -1 }).exec()
  }

  async getAllLatestRates() {
    const rates = await this.model
      .aggregate([
        {
          $sort: { lastUpdated: -1 },
        },
        {
          $group: {
            _id: "$cryptocurrency",
            rate: { $first: "$$ROOT" },
          },
        },
        {
          $replaceRoot: { newRoot: "$rate" },
        },
      ])
      .exec()

    return rates
  }

  async upsertRate(cryptocurrency: string, buyRate: number, sellRate: number, source: string, metadata?: any) {
    return this.model
      .findOneAndUpdate(
        { cryptocurrency },
        {
          buyRate,
          sellRate,
          source,
          lastUpdated: new Date(),
          metadata,
        },
        { upsert: true, new: true },
      )
      .exec()
  }
}
