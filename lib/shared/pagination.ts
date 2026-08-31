/** Shared list pagination (server + client). */

export const DEFAULT_PAGE_SIZE = 15
export const MAX_PAGE_SIZE = 100

export type PaginatedResult<T> = {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** True when the client asked for a page (list tables); absent → full array for selects. */
export function wantsPagination(searchParams: URLSearchParams): boolean {
  return searchParams.has("page")
}

export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults?: { pageSize?: number }
): { page: number; pageSize: number; skip: number } {
  const fallbackSize = defaults?.pageSize ?? DEFAULT_PAGE_SIZE
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10)
  const rawSize = parseInt(
    searchParams.get("page_size") ??
      searchParams.get("limit") ??
      String(fallbackSize),
    10
  )

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.isFinite(rawSize) && rawSize > 0 ? rawSize : fallbackSize)
  )

  return { page, pageSize, skip: (page - 1) * pageSize }
}

export function toPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    data,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Slice an in-memory list into a paginated result. */
export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const total = items.length
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return toPaginatedResult(
    items.slice(start, start + pageSize),
    total,
    safePage,
    pageSize
  )
}

/** Parse API JSON that may be paginated `{ data }` or a legacy bare array. */
export function readPaginatedJson<T>(json: unknown): PaginatedResult<T> {
  if (Array.isArray(json)) {
    return toPaginatedResult(
      json as T[],
      json.length,
      1,
      json.length || DEFAULT_PAGE_SIZE
    )
  }
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as { data?: unknown }).data)
  ) {
    const obj = json as Partial<PaginatedResult<T>> & { data: T[] }
    const page = typeof obj.page === "number" && obj.page > 0 ? obj.page : 1
    const pageSize =
      typeof obj.pageSize === "number" && obj.pageSize > 0
        ? obj.pageSize
        : DEFAULT_PAGE_SIZE
    const total = typeof obj.total === "number" ? obj.total : obj.data.length
    return toPaginatedResult(obj.data, total, page, pageSize)
  }
  return toPaginatedResult<T>([], 0, 1, DEFAULT_PAGE_SIZE)
}
