"use client"

import { PageSection } from "@/components/layout"
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
      return <Badge variant="default">Approved</Badge>
    case 2:
      return <Badge variant="destructive">Rejected</Badge>
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
        <PageSection key={date} title={formatDate(date)}>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Item name</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.idPermintaan}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.stokbarang.namaBrg}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>{item.stokbarang.satuan}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </PageSection>
      ))}
    </div>
  )
}
