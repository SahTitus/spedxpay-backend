import { connectDatabase } from "../config/database.config"
import { NotificationService } from "../services/shared/notification.service"
import { logger } from "../utils/logger"

async function cleanupNotifications() {
  try {
    await connectDatabase()

    const notificationService = new NotificationService()
    const deletedCount = await notificationService.cleanupExpired()

    logger.info(`Cleanup completed: ${deletedCount} expired notifications deleted`)
    process.exit(0)
  } catch (error) {
    logger.error("Cleanup error:", error)
    process.exit(1)
  }
}

cleanupNotifications()
