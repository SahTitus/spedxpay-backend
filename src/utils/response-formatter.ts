import type { Response } from "express"

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    requestId?: string
  }
}

export function successResponse<T>(message: string, data?: T, meta?: any): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  }
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode: number,
  details: { errors?: { field: string; message: string; value: any }[] } = {},
  code: string,
  extraDetails?: any,
) {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      message,
      details: details.errors || details,
      ...extraDetails,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return res.status(statusCode).json(response)
}

export function paginatedResponse<T>(
  message: string,
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
): ApiResponse<T[]> {
  return {
    success: true,
    message,
    data,
    meta: {
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    },
  }
}
