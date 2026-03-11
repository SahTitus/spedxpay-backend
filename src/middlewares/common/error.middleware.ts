import type { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger.js";
import { errorResponse } from "../../utils/response-formatter.js";
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes.js";

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorMiddleware(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  logger.error("Error occurred:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  let statusCode = error.statusCode || 500;
  let code = error.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message =
    error.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];

  if (error.name === "ValidationError") {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = "Validation failed";
  } else if (error.name === "CastError") {
    statusCode = 400;
    code = ERROR_CODES.INVALID_INPUT;
    message = "Invalid ID format";
  } else if (error.name === "MongoError" && (error as any).code === 11000) {
    statusCode = 409;
    code = ERROR_CODES.USER_ALREADY_EXISTS;
    message = "Resource already exists";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    code = ERROR_CODES.INVALID_TOKEN;
    message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    code = ERROR_CODES.TOKEN_EXPIRED;
    message = "Token expired";
  }

  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];
  }

  errorResponse(res, message, statusCode, { errors: [] }, code, error.details);
}

export function createError(
  message: string,
  statusCode: number,
  code: string,
  details?: any,
): CustomError {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
