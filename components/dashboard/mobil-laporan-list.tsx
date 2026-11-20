import Link from "next/link"
import { Eye } from "lucide-react"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Button } from "@/components/ui/button"
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { formatRupiah } from "@/lib/shared/currency"
import { formatDateId } from "@/lib/shared/date"
import type { DashboardMobilLaporanItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardMobilLaporanItem[]
}

function formatDate(dateString: string) {
  return formatDateId(dateString, dateString)
}

export function DashboardMobilLaporanList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="No mileage reports yet"
        description="No vehicle usage reports yet."
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
              <TableHead>Date</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Reporter</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Travel allowance</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(item.uangJalan)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(item.balanceUangJalan)}
                </TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <TableActionLink
                      label="Detail"
                      icon={Eye}
                      href={`/mobil/admin/laporan/${item.idLaporan}`}
                    />
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/mobil/admin/laporan">View all reports</Link>
        </Button>
      </div>
    </div>
  )
}
