"use client"

import { Eye } from "lucide-react"
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
import { getGroupStatusBadge } from "@/lib/purchasing/permintaan-status"
import { formatDateId } from "@/lib/shared/date"
import type { PermintaanGroupRow } from "../types"

interface Props {
  groups: PermintaanGroupRow[]
  page: number
  pageSize: number
}

function formatDate(dateString: string) {
  return formatDateId(dateString, dateString)
}

export function PermintaanGroupTable({ groups, page, pageSize }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead className="text-right">Item</TableHead>
            <TableHead className="text-right">Total Qty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                <TableCell>{getGroupStatusBadge(group)}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <TableActionLink
                      label={group.hasPending ? "Detail & Approve" : "Detail"}
                      icon={Eye}
                      href={detailHref}
                    />
                  </TableActions>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
