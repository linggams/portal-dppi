import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"

export const PENGAJUAN_GROUP_PAGE_SIZE = 20

export interface PengajuanGroupFilters {
  startDate: string
  endDate: string
  status?: string | null
  unit?: string | null
  page?: number
  limit?: number
}

export interface PengajuanGroupRow {
  unit: string
  tglPengajuan: string
  jumlahItem: number
  totalQty: number
  totalNominal: number
  statusMin: number
  statusMax: number
  hasPending: boolean
}

export interface PengajuanGroupsSummary {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface PengajuanGroupsResult {
  data: PengajuanGroupRow[]
  summary: PengajuanGroupsSummary
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function getDefaultPengajuanGroupDateRange() {
  return getMonthToDateRangeWIB()
}
