import type {
  PermintaanGroupRow,
  PermintaanGroupsSummary,
} from "@/lib/purchasing/permintaan-group-types"

export type { PermintaanGroupRow, PermintaanGroupsSummary }

export interface PermintaanGroupFilters {
  startDate: string
  endDate: string
  status: string
  unit: string
}

export interface PermintaanGroupsResponse {
  data: PermintaanGroupRow[]
  summary: PermintaanGroupsSummary
  page: number
  pageSize: number
  total: number
  totalPages: number
}
