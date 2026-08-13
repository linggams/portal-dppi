import type { LucideIcon } from "lucide-react"
import { Monitor, Package, Users, Wallet } from "lucide-react"

export const APP_NAME = "DPPI"
export const COMPANY_NAME = "PT DASAN"
export const APP_TITLE = `${APP_NAME} - ${COMPANY_NAME}`
export const APP_TAGLINE = "Portal Manajemen Operasional Terpadu"
export const APP_DESCRIPTION =
  "Sistem terintegrasi untuk pengelolaan pengajuan barang, pengajuan dana, layanan IT support, dan administrasi pengguna."

export type AppModule = {
  icon: LucideIcon
  title: string
  description: string
}

export const APP_MODULES: AppModule[] = [
  {
    icon: Package,
    title: "Pengajuan & Stok Barang",
    description: "Permintaan, pengajuan, stok, dan laporan penggunaan barang",
  },
  {
    icon: Monitor,
    title: "IT Support",
    description: "Tiket bantuan teknis, antrian, dan pelacakan penanganan IT",
  },
  {
    icon: Wallet,
    title: "Pengajuan Dana",
    description: "Ajukan nominal, persetujuan pengelola, dan cetak PDF",
  },
  {
    icon: Users,
    title: "Administrasi Platform",
    description: "Manajemen pengguna dan pengaturan sistem",
  },
]
