import Link from "next/link"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { DashboardStokKritisItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardStokKritisItem[]
  total?: number
}

export function DashboardStokKritisList({ items, total }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Stok aman"
        description="Tidak ada barang dengan stok kritis."
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.kodeBrg}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{item.namaBrg}</p>
              <p className="text-sm text-muted-foreground">
                Sisa: {item.sisa} {item.satuan}
              </p>
            </div>
            <Badge variant="destructive">Kritis</Badge>
          </li>
        ))}
      </ul>
      {total != null && total > items.length ? (
        <p className="text-sm text-muted-foreground">
          +{total - items.length} barang lain dengan stok kritis
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/purchasing/admin/kategori">Kelola stok</Link>
        </Button>
      </div>
    </div>
  )
}
