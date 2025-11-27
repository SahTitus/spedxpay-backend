import { GiftCardTypeRepository } from "../../repositories/gift-card-type.repository.js";
import { createError } from "../../middlewares/common/error.middleware.js";
import { ERROR_CODES } from "../../constants/error-codes.js";
import { logger } from "../../utils/logger.js";

export interface CreateGiftCardTypeDto {
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

export interface UpdateGiftCardTypeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  icon?: string;
}

export class AdminGiftCardTypeService {
  private giftCardTypeRepo: GiftCardTypeRepository;

  constructor() {
    this.giftCardTypeRepo = new GiftCardTypeRepository();
  }

  async createGiftCardType(data: CreateGiftCardTypeDto) {
    try {
      // Check if code already exists
      const exists = await this.giftCardTypeRepo.exists(data.code);
      if (exists) {
        throw createError(
          "Gift card type with this code already exists",
          400,
          ERROR_CODES.GIFT_CARD_ALREADY_EXISTS
        );
      }

      const giftCardType = await this.giftCardTypeRepo.create({
        name: data.name,
        code: data.code.toLowerCase(),
        description: data.description,
        icon: data.icon,
        isActive: true,
      });

      logger.info(`Gift card type created: ${giftCardType.code}`);

      return giftCardType;
    } catch (error) {
      logger.error("Create gift card type error:", error);
      throw error;
    }
  }

  async getAllGiftCardTypes(activeOnly = false) {
    return this.giftCardTypeRepo.findAll(activeOnly);
  }

  async getGiftCardType(id: string) {
    const giftCardType = await this.giftCardTypeRepo.findById(id);
    if (!giftCardType) {
      throw createError("Gift card type not found", 404, ERROR_CODES.NOT_FOUND);
    }
    return giftCardType;
  }

  async updateGiftCardType(id: string, data: UpdateGiftCardTypeDto) {
    try {
      const giftCardType = await this.giftCardTypeRepo.findById(id);
      if (!giftCardType) {
        throw createError(
          "Gift card type not found",
          404,
          ERROR_CODES.NOT_FOUND
        );
      }

      const updated = await this.giftCardTypeRepo.update(id, data);

      logger.info(`Gift card type updated: ${giftCardType.code}`);

      return updated;
    } catch (error) {
      logger.error("Update gift card type error:", error);
      throw error;
    }
  }

  async deleteGiftCardType(id: string) {
    try {
      const giftCardType = await this.giftCardTypeRepo.findById(id);
      if (!giftCardType) {
        throw createError(
          "Gift card type not found",
          404,
          ERROR_CODES.NOT_FOUND
        );
      }

      await this.giftCardTypeRepo.delete(id);

      logger.info(`Gift card type deleted: ${giftCardType.code}`);

      return {
        message: "Gift card type deleted successfully",
      };
    } catch (error) {
      logger.error("Delete gift card type error:", error);
      throw error;
    }
  }
}
