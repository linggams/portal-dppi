export interface LaporanFilters {
  startDate: string
  endDate: string
  unit: string
  status: string
}

export interface LaporanSummary {
  totalItems?: number
  totalJumlah?: number
  totalHarga?: number
  pending?: number
  approved?: number
  rejected?: number
  totalStok?: number
  totalKeluar?: number
  totalSisa?: number
  lowStock?: number
}
