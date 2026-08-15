import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"

export const PERMINTAAN_GROUP_PAGE_SIZE = 20

export interface PermintaanGroupFilters {
  startDate: string
  endDate: string
  status?: string | null
  unit?: string | null
  page?: number
  limit?: number
}

export interface PermintaanGroupRow {
  unit: string
  instansi: string
  tglPermintaan: string
  jumlahItem: number
  totalQty: number
  statusMin: number
  statusMax: number
  hasPending: boolean
}

export interface PermintaanGroupsSummary {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface PermintaanGroupsResult {
  data: PermintaanGroupRow[]
  summary: PermintaanGroupsSummary
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function getDefaultPermintaanGroupDateRange() {
  return getMonthToDateRangeWIB()
}
