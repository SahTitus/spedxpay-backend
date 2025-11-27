import { BaseRepository } from "./base/base.repository";
import {
  AdminInvitation,
  type IAdminInvitation,
} from "../models/AdminInvitation.model.js";

export class AdminInvitationRepository extends BaseRepository<IAdminInvitation> {
  constructor() {
    super(AdminInvitation);
  }

  async findByToken(token: string): Promise<IAdminInvitation | null> {
    return this.model
      .findOne({
        token,
        status: "pending",
        expiresAt: { $gt: new Date() },
      })
      .populate("invitedBy", "name email")
      .exec();
  }

  async findByEmail(email: string): Promise<IAdminInvitation | null> {
    return this.model.findOne({ email, status: "pending" }).exec();
  }

  async getPendingInvitations(): Promise<IAdminInvitation[]> {
    return this.model
      .find({ status: "pending", expiresAt: { $gt: new Date() } })
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  async expireOldInvitations(): Promise<void> {
    await this.model
      .updateMany(
        {
          status: "pending",
          expiresAt: { $lt: new Date() },
        },
        { status: "expired" }
      )
      .exec();
  }
}
