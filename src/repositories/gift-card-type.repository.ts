import {
  GiftCardType,
  type IGiftCardType,
} from "../models/GiftCardType.model.js";

export class GiftCardTypeRepository {
  async create(data: Partial<IGiftCardType>): Promise<IGiftCardType> {
    const giftCardType = new GiftCardType(data);
    return giftCardType.save();
  }

  async findAll(activeOnly = false): Promise<IGiftCardType[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return GiftCardType.find(filter).sort({ name: 1 });
  }

  async findById(id: string): Promise<IGiftCardType | null> {
    return GiftCardType.findById(id);
  }

  async findByCode(code: string): Promise<IGiftCardType | null> {
    return GiftCardType.findOne({ code: code.toLowerCase() });
  }

  async update(
    id: string,
    data: Partial<IGiftCardType>
  ): Promise<IGiftCardType | null> {
    return GiftCardType.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await GiftCardType.findByIdAndDelete(id);
    return !!result;
  }

  async exists(code: string, excludeId?: string): Promise<boolean> {
    const query: any = { code: code.toLowerCase() };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const count = await GiftCardType.countDocuments(query);
    return count > 0;
  }
}
