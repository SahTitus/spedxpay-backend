import { BaseRepository } from "./base/base.repository.js";
import {
  PlatformConfig,
  type IPlatformConfig,
} from "../models/PlatformConfig.model.js";

export class PlatformConfigRepository extends BaseRepository<IPlatformConfig> {
  constructor() {
    super(PlatformConfig);
  }

  async getByKey(key: string) {
    return this.model.findOne({ key }).exec();
  }

  async setConfig(
    key: string,
    value: any,
    updatedBy?: string,
    description?: string
  ) {
    return this.model
      .findOneAndUpdate(
        { key },
        {
          value,
          updatedBy,
          description,
        },
        { upsert: true, new: true }
      )
      .exec();
  }

  async getWalletAddresses() {
    const configs = await this.model
      .find({
        key: {
          $in: [
            "wallet_btc",
            "wallet_eth",
            "wallet_usdt",
            "wallet_ltc",
            "wallet_xrp",
          ],
        },
      })
      .exec();

    return {
      btc: configs.find((c) => c.key === "wallet_btc")?.value || "",
      eth: configs.find((c) => c.key === "wallet_eth")?.value || "",
      usdt: configs.find((c) => c.key === "wallet_usdt")?.value || "",
      ltc: configs.find((c) => c.key === "wallet_ltc")?.value || "",
      xrp: configs.find((c) => c.key === "wallet_xrp")?.value || "",
    };
  }

  async getPaymentDetails() {
    const configs = await this.model
      .find({
        key: {
          $in: [
            "momo_number",
            "momo_provider",
            "bank_name",
            "bank_account_number",
            "bank_account_name",
          ],
        },
      })
      .exec();

    return {
      momo: {
        number: configs.find((c) => c.key === "momo_number")?.value || "",
        provider: configs.find((c) => c.key === "momo_provider")?.value || "",
      },
      bank: {
        name: configs.find((c) => c.key === "bank_name")?.value || "",
        accountNumber:
          configs.find((c) => c.key === "bank_account_number")?.value || "",
        accountName:
          configs.find((c) => c.key === "bank_account_name")?.value || "",
      },
    };
  }
}
