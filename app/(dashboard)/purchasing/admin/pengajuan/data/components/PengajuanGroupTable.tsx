"use client"

import { Eye, FileDown } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  TableActionButton,
  TableActionLink,
  TableActions,
} from "@/components/ui/table-actions"
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
import { downloadPengajuanGroupPdf } from "@/lib/purchasing/pengajuan-pdf"
import type { PengajuanGroupRow } from "../types"

interface Props {
  groups: PengajuanGroupRow[]
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

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function PengajuanGroupTable({ groups, page, pageSize }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead className="text-right">Item</TableHead>
            <TableHead className="text-right">Total Qty</TableHead>
            <TableHead className="text-right">Total Nominal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1
            const detailHref = `/purchasing/admin/pengajuan/detail?unit=${encodeURIComponent(group.unit)}&tgl=${group.tglPengajuan}`

            return (
              <TableRow key={`${group.unit}-${group.tglPengajuan}`}>
                <TableCell className="text-muted-foreground">{rowNumber}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(group.tglPengajuan)}
                </TableCell>
                <TableCell className="font-medium">{group.unit}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {group.jumlahItem}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {group.totalQty}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(group.totalNominal)}
                </TableCell>
                <TableCell>{getGroupStatusBadge(group)}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <TableActionLink
                      label={group.hasPending ? "Detail & Approve" : "Detail"}
                      icon={Eye}
                      href={detailHref}
                    />
                    <TableActionButton
                      label="Cetak PDF"
                      icon={FileDown}
                      onClick={() =>
                        downloadPengajuanGroupPdf(group.unit, group.tglPengajuan)
                      }
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
