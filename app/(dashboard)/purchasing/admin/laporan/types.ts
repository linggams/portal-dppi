export interface LaporanFilters {
  startDate: string
  endDate: string
  unit: string
  status: string
}

export interface LaporanSummary {
  totalItems?: number
  totalJumlah?: number
  pending?: number
  approved?: number
}
