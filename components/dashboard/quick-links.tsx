import Link from "next/link"
import { Button } from "@/components/ui/button"

interface QuickLinkGroup {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
}

interface Props {
  groups: QuickLinkGroup[]
}

export function DashboardQuickLinks({ groups }: Props) {
  const links = groups.flatMap((group) => group.links)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {links.map((link) => (
        <Button key={link.href} asChild variant="outline" className="w-full">
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </div>
  )
}

export const PURCHASING_QUICK_LINKS = [
  {
    title: "Purchasing",
    links: [
      { label: "Permintaan", href: "/purchasing/admin/permintaan" },
      { label: "Data Permintaan", href: "/purchasing/admin/permintaan/data" },
      { label: "Pengajuan", href: "/purchasing/admin/pengajuan" },
      { label: "Data Pengajuan", href: "/purchasing/admin/pengajuan/data" },
      { label: "Stok", href: "/purchasing/admin/stok" },
      { label: "Laporan", href: "/purchasing/admin/laporan" },
    ],
  },
] as const

export const IT_QUICK_LINKS = [
  {
    title: "IT Support",
    links: [
      { label: "Antrian Tiket", href: "/it/staff/tiket" },
      { label: "Log Pekerjaan", href: "/it/staff/maintenance" },
      { label: "Kategori Tiket", href: "/it/staff/kategori" },
      { label: "Laporan", href: "/it/staff/laporan" },
    ],
  },
] as const

export const DANA_QUICK_LINKS = [
  {
    title: "Pengajuan Dana",
    links: [
      { label: "Antrian", href: "/dana/admin/antrian" },
      { label: "List Pengajuan", href: "/dana/admin/pengajuan" },
      { label: "Laporan", href: "/dana/admin/laporan" },
    ],
  },
] as const

export const MOBIL_QUICK_LINKS = [
  {
    title: "Penggunaan Mobil",
    links: [
      { label: "Laporan KM", href: "/mobil/admin/laporan" },
      { label: "Input Laporan", href: "/mobil/admin/laporan/baru" },
      { label: "Kendaraan", href: "/mobil/admin/kendaraan" },
      { label: "Jenis", href: "/mobil/admin/jenis" },
    ],
  },
] as const
