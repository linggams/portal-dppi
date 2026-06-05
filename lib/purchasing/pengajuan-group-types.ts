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
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: firstDay.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  }
}
