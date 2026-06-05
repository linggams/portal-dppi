import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Eye } from "lucide-react"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Button } from "@/components/ui/button"
import { TableActionLink } from "@/components/ui/table-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { getPermintaanGroupStatusBadge } from "@/lib/purchasing/permintaan-status"
import type { DashboardPermintaanItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardPermintaanItem[]
  viewAllHref?: string
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

export function DashboardPendingPermintaanList({
  items,
  viewAllHref = "/purchasing/admin/permintaan/data?status=0",
}: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Tidak ada permintaan pending"
        description="Semua permintaan sudah diproses."
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-4">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const detailHref = `/purchasing/admin/permintaan/detail?unit=${encodeURIComponent(item.unit)}&tgl=${item.tglPermintaan}`

              return (
                <TableRow key={`${item.unit}-${item.tglPermintaan}`}>
                  <TableCell className="font-medium">{item.unit}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(item.tglPermintaan)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.jumlahItem}
                  </TableCell>
                  <TableCell>
                    {getPermintaanGroupStatusBadge(item)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableActionLink
                      label="Detail"
                      icon={Eye}
                      href={detailHref}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href={viewAllHref}>Lihat semua permintaan</Link>
        </Button>
      </div>
    </div>
  )
}
