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
import type { DashboardMobilLaporanItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardMobilLaporanItem[]
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

export function DashboardMobilLaporanList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Belum ada laporan KM"
        description="Belum ada laporan penggunaan mobil."
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
              <TableHead>Tanggal</TableHead>
              <TableHead>Nopol</TableHead>
              <TableHead>Pemohon</TableHead>
              <TableHead className="text-right">Pemakaian</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idLaporan}>
                <TableCell className="whitespace-nowrap">
                  {formatDate(item.tanggal)}
                </TableCell>
                <TableCell className="font-medium">{item.nopol}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.pemakaian.toLocaleString("id-ID")} KM
                </TableCell>
                <TableCell className="text-right">
                  <TableActionLink
                    label="Detail"
                    icon={Eye}
                    href={`/mobil/admin/laporan/${item.idLaporan}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/mobil/admin/laporan">Lihat semua laporan</Link>
        </Button>
      </div>
    </div>
  )
}
