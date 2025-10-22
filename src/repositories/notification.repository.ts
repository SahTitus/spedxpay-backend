import { BaseRepository } from "./base/base.repository"
import { Notification, type INotification } from "@/models/Notification.model"

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification)
  }

  async findByUserId(userId: string, unreadOnly = false): Promise<INotification[]> {
    const filter: any = { userId }
    if (unreadOnly) {
      filter.read = false
    }
    return this.model.find(filter).sort({ createdAt: -1 }).exec()
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return this.model.findByIdAndUpdate(notificationId, { read: true }, { new: true }).exec()
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.model.updateMany({ userId, read: false }, { read: true }).exec()
  }

  async deleteExpired(): Promise<number> {
    const result = await this.model
      .deleteMany({
        expiresAt: { $lt: new Date() },
      })
      .exec()
    return result.deletedCount || 0
  }
}
