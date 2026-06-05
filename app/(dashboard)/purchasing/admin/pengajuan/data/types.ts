import type {
  PengajuanGroupRow,
  PengajuanGroupsSummary,
} from "@/lib/purchasing/pengajuan-group-types"

export type { PengajuanGroupRow, PengajuanGroupsSummary }

export interface PengajuanGroupFilters {
  startDate: string
  endDate: string
  status: string
  unit: string
}

export interface PengajuanGroupsResponse {
  data: PengajuanGroupRow[]
  summary: PengajuanGroupsSummary
  page: number
  pageSize: number
  total: number
  totalPages: number
}
