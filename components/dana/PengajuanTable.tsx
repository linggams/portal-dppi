"use client"

import { Eye, Pencil, Printer, Wallet, XCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import {
  TableActionButton,
  TableActionLink,
  TableActions,
} from "@/components/ui/table-actions"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import {
  isDanaCancellable,
  isDanaEditable,
  isDanaKembalianEditable,
  isDanaPrintable,
} from "@/lib/dana/constants"
import { formatDanaDateOnly, formatRupiah } from "@/lib/dana/format"
import { getDanaStatusBadge } from "@/lib/dana/status"

export function PengajuanTable({
  rows,
  detailHref,
  showPemohon = false,
  onRevise,
  onCancel,
  onKembalian,
  onPrint,
}: {
  rows: DanaPengajuan[]
  detailHref: (row: DanaPengajuan) => string
  showPemohon?: boolean
  onRevise?: (row: DanaPengajuan) => void
  onCancel?: (row: DanaPengajuan) => void
  onKembalian?: (row: DanaPengajuan) => void
  onPrint?: (row: DanaPengajuan) => void
}) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomor</TableHead>
            {showPemohon ? <TableHead>Pemohon</TableHead> : null}
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Nominal</TableHead>
            <TableHead className="text-right">Kembalian</TableHead>
            <TableHead>Keperluan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.idPengajuan}>
              <TableCell className="font-medium">{row.nomor}</TableCell>
              {showPemohon ? (
                <TableCell>
                  {row.username}
                  <span className="block text-xs text-muted-foreground">
                    {row.jabatan}
                  </span>
                </TableCell>
              ) : null}
              <TableCell>{formatDanaDateOnly(row.tglDibuat)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatRupiah(row.nominal)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatRupiah(row.kembalian)}
              </TableCell>
              <TableCell className="max-w-[280px] truncate">
                {row.keperluan}
              </TableCell>
              <TableCell>{getDanaStatusBadge(row.status)}</TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <TableActionLink
                    label="Detail"
                    icon={Eye}
                    href={detailHref(row)}
                  />
                  {onRevise && isDanaEditable(row.status) ? (
                    <TableActionButton
                      label="Revisi"
                      icon={Pencil}
                      onClick={() => onRevise(row)}
                    />
                  ) : null}
                  {onCancel && isDanaCancellable(row.status) ? (
                    <TableActionButton
                      label="Batalkan"
                      icon={XCircle}
                      className="text-destructive hover:text-destructive"
                      onClick={() => onCancel(row)}
                    />
                  ) : null}
                  {onKembalian && isDanaKembalianEditable(row.status) ? (
                    <TableActionButton
                      label="Kembalian"
                      icon={Wallet}
                      onClick={() => onKembalian(row)}
                    />
                  ) : null}
                  {onPrint && isDanaPrintable(row.status) ? (
                    <TableActionButton
                      label="Cetak PDF"
                      icon={Printer}
                      onClick={() => onPrint(row)}
                    />
                  ) : null}
                </TableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
