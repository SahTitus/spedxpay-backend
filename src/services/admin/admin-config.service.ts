import { PlatformConfigRepository } from "@/repositories/platform-config.repository"
import { logger } from "@/utils/logger"

export interface UpdatePlatformConfigDto {
  wallets?: {
    btc?: string
    eth?: string
    usdt?: string
    ltc?: string
    xrp?: string
  }
  payment?: {
    momoNumber?: string
    momoProvider?: string
    bankName?: string
    bankAccountNumber?: string
    bankAccountName?: string
  }
}

export class AdminConfigService {
  private platformConfigRepo: PlatformConfigRepository

  constructor() {
    this.platformConfigRepo = new PlatformConfigRepository()
  }

  async getPlatformConfig() {
    const wallets = await this.platformConfigRepo.getWalletAddresses()
    const payment = await this.platformConfigRepo.getPaymentDetails()

    return {
      wallets,
      payment,
    }
  }

  async updatePlatformConfig(adminId: string, data: UpdatePlatformConfigDto) {
    try {
      const updates = []

      // Update wallet addresses
      if (data.wallets) {
        for (const [key, value] of Object.entries(data.wallets)) {
          if (value) {
            await this.platformConfigRepo.setConfig(
              `wallet_${key}`,
              value,
              adminId,
              `${key.toUpperCase()} wallet address`,
            )
            updates.push(`wallet_${key}`)
          }
        }
      }

      // Update payment details
      if (data.payment) {
        if (data.payment.momoNumber) {
          await this.platformConfigRepo.setConfig("momo_number", data.payment.momoNumber, adminId, "MoMo number")
          updates.push("momo_number")
        }
        if (data.payment.momoProvider) {
          await this.platformConfigRepo.setConfig("momo_provider", data.payment.momoProvider, adminId, "MoMo provider")
          updates.push("momo_provider")
        }
        if (data.payment.bankName) {
          await this.platformConfigRepo.setConfig("bank_name", data.payment.bankName, adminId, "Bank name")
          updates.push("bank_name")
        }
        if (data.payment.bankAccountNumber) {
          await this.platformConfigRepo.setConfig(
            "bank_account_number",
            data.payment.bankAccountNumber,
            adminId,
            "Bank account number",
          )
          updates.push("bank_account_number")
        }
        if (data.payment.bankAccountName) {
          await this.platformConfigRepo.setConfig(
            "bank_account_name",
            data.payment.bankAccountName,
            adminId,
            "Bank account name",
          )
          updates.push("bank_account_name")
        }
      }

      logger.info(`Platform config updated by admin ${adminId}: ${updates.join(", ")}`)

      return {
        message: "Platform configuration updated successfully",
        updatedFields: updates,
      }
    } catch (error) {
      logger.error("Update platform config error:", error)
      throw error
    }
  }
}
