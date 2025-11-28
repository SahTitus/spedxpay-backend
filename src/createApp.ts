import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorMiddleware } from "./middlewares/common/error.middleware.js";
import { logger } from "./utils/logger.js";
import routes from "./routes/index.js";

export function createApp(): Application {
  const app = express();

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

  return app;
}
