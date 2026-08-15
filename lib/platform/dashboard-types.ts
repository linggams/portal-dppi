export const STOK_KRITIS_THRESHOLD = 5
export const DASHBOARD_LIST_LIMIT = 5
export const DASHBOARD_LIST_DAYS = 30

export type PlatformDashboardTab =
  | "purchasing"
  | "it"
  | "dana"
  | "mobil"

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

export interface DashboardDanaItem {
  idPengajuan: number
  nomor: string
  username: string
  jabatan: string
  nominal: number
  tglDibuat: string
}

export interface DashboardDanaStats {
  pending: number
  approvedToday: number
  rejectedToday: number
  totalBulan: number
  pendingList: DashboardDanaItem[]
}

export interface DashboardMobilLaporanItem {
  idLaporan: number
  tanggal: string
  username: string
  nopol: string
  pemakaian: number
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
  it: DashboardItStats
  dana: DashboardDanaStats
  mobil: DashboardMobilStats
}
