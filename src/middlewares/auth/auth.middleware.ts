import type { Request, Response, NextFunction } from "express"
import { verifyToken } from "@/utils/jwt"
import { errorResponse } from "@/utils/response-formatter"
import { ERROR_CODES, ERROR_MESSAGES } from "@/constants/error-codes"
import { logger } from "@/utils/logger"

export interface AuthRequest<P = any> extends Request<P> {
  user?: {
    userId: string
    role: string
    email: string
  }
}


export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      errorResponse(res, ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED], 401, {}, ERROR_CODES.UNAUTHORIZED)
      return 
    }

    const token = authHeader.substring(7)

    try {
      const decoded = verifyToken(token)
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
      }
      next()
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        errorResponse(res, ERROR_MESSAGES[ERROR_CODES.TOKEN_EXPIRED], 401, {}, ERROR_CODES.TOKEN_EXPIRED)
        return 
      }
      errorResponse(res, ERROR_MESSAGES[ERROR_CODES.INVALID_TOKEN], 401, {}, ERROR_CODES.INVALID_TOKEN)
      return 
    }
  } catch (error) {
    logger.error("Auth middleware error:", error)
    errorResponse(
      res,
      ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
      500,
      {},
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    )
    return 
  }
}
