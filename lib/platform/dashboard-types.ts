export const STOK_KRITIS_THRESHOLD = 5
export const DASHBOARD_LIST_LIMIT = 5
export const DASHBOARD_LIST_DAYS = 30

export interface DashboardUserStats {
  total: number
  byLevel: {
    user: number
    administrator: number
    it_support: number
    purchasing: number
  }
}

export interface DashboardPermintaanItem {
  unit: string
  instansi: string
  tglPermintaan: string
  jumlahItem: number
  totalQty: number
  hasPending: boolean
  statusMin: number
  statusMax: number
}

export interface DashboardPengajuanItem {
  unit: string
  tglPengajuan: string
  jumlahItem: number
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

export interface DashboardTiketItem {
  idTiket: number
  nomorTiket: string
  judul: string
  status: number
}

export interface DashboardPurchasingStats {
  permintaanPendingToday: number
  pengajuanPendingToday: number
  pendingPermintaan: DashboardPermintaanItem[]
  pendingPengajuan: DashboardPengajuanItem[]
  stokKritis: DashboardStokKritisItem[]
  stokKritisTotal: number
}

export interface DashboardItStats {
  total: number
  baru: number
  aktif: number
  selesai: number
  tiketBaru: DashboardTiketItem[]
}

export interface PlatformDashboardStats {
  users: DashboardUserStats
  purchasing: DashboardPurchasingStats
  it: DashboardItStats
}

export interface PurchasingDashboardStats {
  permintaanPendingToday: number
  pengajuanPendingToday: number
  pendingPermintaan: DashboardPermintaanItem[]
  pendingPengajuan: DashboardPengajuanItem[]
}
