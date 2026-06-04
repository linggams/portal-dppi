"use client"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { Badge } from "@/components/ui/badge"
import type { Permintaan } from "../types"

interface DataPermintaanTableProps {
  groupedPermintaan: Record<string, Permintaan[]>
  formatDate: (dateString: string) => string
}

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return <Badge variant="outline">Pending</Badge>
    case 1:
      return <Badge variant="default">Disetujui</Badge>
    case 2:
      return <Badge variant="destructive">Ditolak</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function DataPermintaanTable({
  groupedPermintaan,
  formatDate,
}: DataPermintaanTableProps) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedPermintaan).map(([date, items]) => (
        <Card key={date} className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            {formatDate(date)}
          </h2>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.idPermintaan}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.stokbarang.namaBrg}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>{item.stokbarang.satuan}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ))}
    </div>
  )
}
