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
import { getGroupStatusBadge } from "@/lib/purchasing/permintaan-status"
import type { DashboardPengajuanItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardPengajuanItem[]
  viewAllHref?: string
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function DashboardPendingPengajuanList({
  items,
  viewAllHref = "/purchasing/admin/pengajuan/data?status=0",
}: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Tidak ada pengajuan pending"
        description="Semua pengajuan sudah diproses."
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
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const detailHref = `/purchasing/admin/pengajuan/detail?unit=${encodeURIComponent(item.unit)}&tgl=${item.tglPengajuan}`

              return (
                <TableRow key={`${item.unit}-${item.tglPengajuan}`}>
                  <TableCell className="font-medium">{item.unit}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(item.tglPengajuan)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatRupiah(item.totalNominal)}
                  </TableCell>
                  <TableCell>{getGroupStatusBadge(item)}</TableCell>
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
          <Link href={viewAllHref}>Lihat semua pengajuan</Link>
        </Button>
      </div>
    </div>
  )
}
