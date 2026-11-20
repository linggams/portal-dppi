import type { LucideIcon } from "lucide-react"
import { Car, Headset, Package, Users } from "lucide-react"

export const APP_NAME = "DPPI"
export const COMPANY_NAME = "PT DASAN"
export const COMPANY_LEGAL_NAME = "PT DASAN PAN PACIFIC INDONESIA"
export const COMPANY_ADDRESS =
  "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355"
export const COMPANY_MARK = "DASAN"
export const APP_TITLE = `${APP_NAME} - ${COMPANY_NAME}`
export const APP_TAGLINE = "Integrated Operations Management Portal"
export const APP_DESCRIPTION =
  "Integrated system for goods requests, IT Management, and user administration."

export type AppModule = {
  icon: LucideIcon
  title: string
  description: string
}

export const APP_MODULES: AppModule[] = [
  {
    icon: Package,
    title: "Purchasing",
    description: "Requests, submissions, stock, and usage reports",
  },
  {
    icon: Headset,
    title: "IT Management",
    description: "Tickets, SLA, SOP, NIST mapping, and assets",
  },
  {
    icon: Car,
    title: "Vehicle Usage",
    description: "Mileage reports, vehicles, and trip costs",
  },
  {
    icon: Users,
    title: "Platform",
    description: "User management and system settings",
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
