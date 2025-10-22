export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginationResult {
  skip: number
  limit: number
  page: number
  sort: Record<string, 1 | -1>
}

export function getPaginationParams(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const skip = (page - 1) * limit

  const sort: Record<string, 1 | -1> = {}
  if (options.sortBy) {
    sort[options.sortBy] = options.sortOrder === "desc" ? -1 : 1
  } else {
    sort.createdAt = -1
  }

  return {
    skip,
    limit,
    page,
    sort,
  }
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit)
}
