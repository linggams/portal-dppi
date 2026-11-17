export const STOK_KRITIS_THRESHOLD = 5
export const DASHBOARD_LIST_LIMIT = 5
export const DASHBOARD_LIST_DAYS = 30

export type PlatformDashboardTab = "purchasing" | "itms" | "mobil"

export interface DashboardUserStats {
  total: number
  roleCount: number
}

export interface DashboardPermintaanItem {
  unit: string
  tglPermintaan: string
  jumlahItem: number
  hasPending: boolean
  statusMin: number
  statusMax: number
}

export interface DashboardPengajuanItem {
  unit: string
  tglPengajuan: string
  totalNominal: number
  hasPending: boolean
  statusMin: number
  statusMax: number
}

export interface DashboardStokKritisItem {
  kodeBrg: string
  namaBrg: string
  sisa: number
  satuan: string
}

export interface DashboardItmsTicketItem {
  idTicket: number
  number: string
  title: string
  status: string
  priority: string
}

export interface DashboardPurchasingStats {
  permintaanPendingToday: number
  pengajuanPendingToday: number
  pendingPermintaan: DashboardPermintaanItem[]
  pendingPengajuan: DashboardPengajuanItem[]
  stokKritis: DashboardStokKritisItem[]
  stokKritisTotal: number
}

export interface DashboardItmsStats {
  total: number
  open: number
  unassigned: number
  resolved: number
  newTickets: DashboardItmsTicketItem[]
}

export interface DashboardMobilLaporanItem {
  idLaporan: number
  tanggal: string
  username: string
  nopol: string
  pemakaian: number
  uangJalan: number
  balanceUangJalan: number
}

export interface DashboardMobilStats {
  laporanHariIni: number
  kmBulan: number
  kendaraanAktif: number
  laporanTerbaru: DashboardMobilLaporanItem[]
}

export interface PlatformDashboardStats {
  users: DashboardUserStats
  purchasing: DashboardPurchasingStats
  itms: DashboardItmsStats
  mobil: DashboardMobilStats
}
