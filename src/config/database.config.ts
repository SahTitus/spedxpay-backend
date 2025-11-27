import mongoose from "mongoose"
import { appConfig } from "./app.config"
import { logger } from "../utils/logger"

export async function connectDatabase(): Promise<void> {
  try {
    logger.info("🔃 Connecting to MongoDB...");
    await mongoose.connect(appConfig.database.uri)
    logger.info("✅ MongoDB connected successfully")
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected")
})

mongoose.connection.on("error", (error) => {
  logger.error("MongoDB error:", error)
})
