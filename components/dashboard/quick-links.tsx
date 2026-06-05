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
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {groups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {group.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.links.map((link) => (
              <Button key={link.href} asChild variant="outline" size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const PLATFORM_QUICK_LINKS = [
  {
    title: "Platform",
    links: [{ label: "Kelola User", href: "/platform/users" }],
  },
  {
    title: "Purchasing",
    links: [
      { label: "Data Permintaan", href: "/purchasing/admin/permintaan/data" },
      { label: "Data Pengajuan", href: "/purchasing/admin/pengajuan/data" },
      { label: "Laporan", href: "/purchasing/admin/laporan" },
      { label: "Kategori", href: "/purchasing/admin/kategori" },
    ],
  },
  {
    title: "IT Support",
    links: [
      { label: "Antrian Tiket", href: "/it/staff/tiket" },
      { label: "Log Pekerjaan", href: "/it/staff/maintenance" },
      { label: "Kategori Tiket", href: "/it/staff/kategori" },
    ],
  },
] as const

export const PURCHASING_STAFF_QUICK_LINKS = [
  {
    title: "Operasional",
    links: [
      { label: "Data Permintaan", href: "/purchasing/admin/permintaan/data" },
      { label: "Data Pengajuan", href: "/purchasing/admin/pengajuan/data" },
      { label: "Form Permintaan", href: "/purchasing/admin/permintaan" },
      { label: "Form Pengajuan", href: "/purchasing/admin/pengajuan" },
    ],
  },
] as const
