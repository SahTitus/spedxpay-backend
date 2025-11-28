import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/common/error.middleware.js";
import { logger } from "./utils/logger.js";
import { connectDatabase } from "./config/database.config.js";
import { appConfig } from "./config/app.config.js";
import { schedulerService } from "./services/scheduler/scheduler.service.js";
import routes from "./routes/index.js";

// Create Express application instance
const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "spedxpay-backend is running!",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "not_found",
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Initialize database connection and background jobs
async function bootstrap() {
  try {
    await connectDatabase();
    schedulerService.initialize();
    logger.info("Scheduler service initialized");
  } catch (err) {
    logger.error("Application bootstrap failed", err);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Initialize bootstrap in background (don't await it)
bootstrap();

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