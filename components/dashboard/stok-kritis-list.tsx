import Link from "next/link"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
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
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Barang</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead className="text-right">Sisa</TableHead>
              <TableHead>Satuan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.kodeBrg}>
                <TableCell className="font-medium">{item.kodeBrg}</TableCell>
                <TableCell>{item.namaBrg}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-destructive">
                  {item.sisa}
                </TableCell>
                <TableCell>{item.satuan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
