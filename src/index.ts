import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.config.js";
import { appConfig } from "./config/app.config.js";
import { logger } from "./utils/logger.js";
import { schedulerService } from "./services/scheduler/scheduler.service.js";

// Create Express application instance
const app = createApp();

// Initialize database connection and background jobs
async function bootstrap() {
  await connectDatabase();
  schedulerService.initialize();
  logger.info("Scheduler service initialized");
}

bootstrap().catch((err) => {
  logger.error("Application bootstrap failed", err);
  process.exit(1);
});

// Start HTTP server only in local or non-Vercel environments
if (!process.env.VERCEL) {
  const server = app.listen(appConfig.port, () => {
    logger.info(`Server running on http://localhost:${appConfig.port}`);
    logger.info(`Environment: ${appConfig.env}`);
    logger.info(`API Version: ${appConfig.apiVersion}`);
  });

  // Graceful shutdown handler
  const shutdown = () => {
    logger.info("Shutting down gracefully...");
    schedulerService.stopAll();
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

// Export raw Express app for Vercel serverless functions
export default app;
