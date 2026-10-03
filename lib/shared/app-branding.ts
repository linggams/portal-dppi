import type { LucideIcon } from "lucide-react"
import { Monitor, Package, Users } from "lucide-react"

export const APP_NAME = "DPPI"
export const COMPANY_NAME = "PT DASAN"
export const COMPANY_LEGAL_NAME = "PT DASAN PAN PACIFIC INDONESIA"
export const COMPANY_ADDRESS =
  "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355"
export const COMPANY_MARK = "DASAN"
export const APP_TITLE = `${APP_NAME} - ${COMPANY_NAME}`
export const APP_TAGLINE = "Portal Manajemen Operasional Terpadu"
export const APP_DESCRIPTION =
  "Sistem terintegrasi untuk pengelolaan pengajuan barang, layanan IT support, dan administrasi pengguna."

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
    icon: Users,
    title: "Administrasi Platform",
    description: "Manajemen pengguna dan pengaturan sistem",
  },
]

export function companyPdfHeader(options?: {
  lineWidth?: number
  afterLine?: number
}) {
  const lineWidth = options?.lineWidth ?? 515
  const afterLine = options?.afterLine ?? 8
  return [
    {
      text: COMPANY_LEGAL_NAME,
      style: "header",
      alignment: "center",
    },
    {
      text: COMPANY_ADDRESS,
      style: "subheader",
      alignment: "center",
      margin: [0, 4, 0, 8],
    },
    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: lineWidth, y2: 0, lineWidth: 1 }],
      margin: [0, 0, 0, afterLine],
    },
  ]
}
