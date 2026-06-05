"use client"

import { Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
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
import type { PermintaanGroupRow } from "../types"

interface Props {
  groups: PermintaanGroupRow[]
  page: number
  pageSize: number
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

export function PermintaanGroupTable({ groups, page, pageSize }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Instansi</TableHead>
            <TableHead className="text-right">Item</TableHead>
            <TableHead className="text-right">Total Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1
            const detailHref = `/purchasing/admin/permintaan/detail?unit=${encodeURIComponent(group.unit)}&tgl=${group.tglPermintaan}`

            return (
              <TableRow key={`${group.unit}-${group.tglPermintaan}`}>
                <TableCell className="text-muted-foreground">{rowNumber}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(group.tglPermintaan)}
                </TableCell>
                <TableCell className="font-medium">{group.unit}</TableCell>
                <TableCell>{group.instansi}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {group.jumlahItem}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {group.totalQty}
                </TableCell>
                <TableCell>{getPermintaanGroupStatusBadge(group)}</TableCell>
                <TableCell className="text-right">
                  <TableActionLink
                    label={group.hasPending ? "Detail & Approve" : "Detail"}
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
  )
}
