import { createApp } from "./app"
import { connectDatabase } from "@/config/database.config"
import { appConfig } from "@/config/app.config"
import { logger } from "@/utils/logger"
import { schedulerService } from "./services/scheduler/scheduler.service"

async function startServer() {
  try {
    // Connect to database
    await connectDatabase()

    // Create Express app
    const app = createApp()

    schedulerService.initialize()
    logger.info("✓ Scheduler service initialized - all cron jobs are running")

    // Start server
    const server = app.listen(appConfig.port, () => {
      logger.info(`Server running on port ${appConfig.port}`)
      logger.info(`Environment: ${appConfig.env}`)
      logger.info(`API Version: ${appConfig.apiVersion}`)
    })

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info( "SIGTERM signal received: closing HTTP server" )
      schedulerService.stopAll()
      server.close(() => {
        logger.info("HTTP server closed")
        process.exit(0)
      })
    })

    process.on("SIGINT", () => {
      logger.info( "SIGINT signal received: closing HTTP server" )
      schedulerService.stopAll()
      server.close(() => {
        logger.info("HTTP server closed")
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
