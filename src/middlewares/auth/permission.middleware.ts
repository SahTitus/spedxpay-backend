import type { Response, NextFunction } from "express"
import type { AuthRequest } from "./auth.middleware"
import { errorResponse } from "../../utils/response-formatter"
import { ERROR_CODES, ERROR_MESSAGES } from "../../constants/error-codes"
import { USER_ROLE } from "../../constants/statuses"

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse( res, ERROR_MESSAGES[ ERROR_CODES.UNAUTHORIZED ], 401, {}, ERROR_CODES.UNAUTHORIZED )
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse( res, ERROR_MESSAGES[ ERROR_CODES.FORBIDDEN ], 403, {}, ERROR_CODES.FORBIDDEN )
      return
    }

    next()
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  return requireRole(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.ASSISTANT_ADMIN)(req, res, next)
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  return requireRole(USER_ROLE.SUPER_ADMIN)(req, res, next)
}
