import { connectDatabase } from "@/config/database.config"
import { GoogleVoiceService } from "@/services/google-voice/google-voice.service"
import { logger } from "@/utils/logger"

async function cleanupGoogleVoiceOrders() {
  try {
    await connectDatabase()

    const googleVoiceService = new GoogleVoiceService()
    const result = await googleVoiceService.autoCompleteExpiredOrders()

    logger.info(`Cleanup completed: ${result.completedCount} orders auto-completed`)
    process.exit(0)
  } catch (error) {
    logger.error("Cleanup error:", error)
    process.exit(1)
  }
}

cleanupGoogleVoiceOrders()
