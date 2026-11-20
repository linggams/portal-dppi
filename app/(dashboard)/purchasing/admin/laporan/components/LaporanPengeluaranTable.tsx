"use client"

import { TableContainer } from "@/components/ui/table-container"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildPengeluaranTableRows,
  type PengeluaranTableRow,
} from "@/lib/purchasing/laporan-group"
import { cn } from "@/lib/utils"
import { formatDate } from "../utils"

const borderedTableClass =
  "border-collapse border border-border [&_tr]:border-0 [&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border"

interface Props {
  data: Record<string, unknown>[]
}

function toneClass(row: PengeluaranTableRow) {
  if (row.type === "grand") return "bg-muted font-semibold"
  if (row.type === "date-subtotal") return "bg-muted/40 font-medium"
  if (row.type === "user-subtotal") return "bg-muted/20 font-medium"
  return ""
}

export function LaporanPengeluaranTable({ data }: Props) {
  const { rows } = buildPengeluaranTableRows(data, formatDate)
  if (rows.length === 0) return null

  return (
    <TableContainer className="border-0">
      <Table className={borderedTableClass}>
          <TableHeader className="[&_tr]:border-0">
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Item name</TableHead>
              <TableHead className="font-semibold text-right">Qty</TableHead>
              <TableHead className="font-semibold text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              if (row.type === "item") {
                return (
                  <TableRow
                    key={row.key}
                    className="border-0 hover:bg-transparent"
                  >
                    {row.showTanggal ? (
                      <TableCell
                        rowSpan={row.tanggalRowSpan}
                        className="align-middle font-medium whitespace-nowrap"
                      >
                        {row.tanggalLabel}
                      </TableCell>
                    ) : null}
                    {row.showUser ? (
                      <TableCell
                        rowSpan={row.userRowSpan}
                        className="align-middle whitespace-nowrap"
                      >
                        {row.user}
                      </TableCell>
                    ) : null}
                    <TableCell>{row.namaBarang}</TableCell>
                    <TableCell className="text-right">{row.qty}</TableCell>
                    <TableCell className="text-right">{row.total}</TableCell>
                  </TableRow>
                )
              }

              if (row.type === "user-subtotal") {
                return (
                  <TableRow
                    key={row.key}
                    className={cn(
                      "border-0 hover:bg-transparent",
                      toneClass(row)
                    )}
                  >
                    {/* Tanggal masih di-span; User selesai */}
                    <TableCell colSpan={2} className="font-medium">
                      {row.label}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.qty}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.total}
                    </TableCell>
                  </TableRow>
                )
              }

              // date-subtotal / grand — di luar rowspan tanggal
              return (
                <TableRow
                  key={row.key}
                  className={cn(
                    "border-0 hover:bg-transparent",
                    toneClass(row)
                  )}
                >
                  <TableCell colSpan={3} className="font-medium">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.qty}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.total}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
      </Table>
    </TableContainer>
  )
}
