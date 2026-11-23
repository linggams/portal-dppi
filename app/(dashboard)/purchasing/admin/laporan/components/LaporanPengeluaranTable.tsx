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
  buildPengeluaranCategorySections,
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
  if (row.type === "date-header") return "bg-muted font-semibold"
  if (row.type === "category-subtotal") return "bg-muted/50 font-medium"
  if (row.type === "date-subtotal") return "bg-muted/40 font-medium"
  if (row.type === "user-subtotal") return "bg-muted/20 font-medium"
  return ""
}

function CategoryTable({ rows }: { rows: PengeluaranTableRow[] }) {
  return (
    <TableContainer className="border-0">
      <Table className={borderedTableClass}>
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0 bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">User</TableHead>
            <TableHead className="font-semibold">Item name</TableHead>
            <TableHead className="font-semibold text-right">Qty</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            if (row.type === "date-header") {
              return (
                <TableRow
                  key={row.key}
                  className={cn(
                    "border-0 hover:bg-transparent",
                    toneClass(row)
                  )}
                >
                  <TableCell colSpan={4} className="font-semibold">
                    {row.label}
                  </TableCell>
                </TableRow>
              )
            }

            if (row.type === "item") {
              return (
                <TableRow
                  key={row.key}
                  className="border-0 hover:bg-transparent"
                >
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

            return (
              <TableRow
                key={row.key}
                className={cn(
                  "border-0 hover:bg-transparent",
                  toneClass(row)
                )}
              >
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
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function LaporanPengeluaranTable({ data }: Props) {
  const { categories, grandQty } = buildPengeluaranCategorySections(
    data,
    formatDate
  )
  if (categories.length === 0) return null

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat.key} className="overflow-hidden rounded-md">
          <div className="flex flex-wrap items-center justify-between gap-2 border border-b-0 border-border bg-muted px-3 py-2">
            <span className="text-sm font-medium">
              Kategori: {cat.label}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
              {cat.itemCount} item · jml {cat.qty}
              {cat.users.length > 0 ? ` · ${cat.users.length} user` : ""}
            </span>
          </div>
          <CategoryTable rows={cat.rows} />
        </div>
      ))}

      <TableContainer className="border-0">
        <Table className={cn(borderedTableClass, "w-full text-sm")}>
          <TableBody>
            <TableRow className="border-0 bg-muted font-semibold hover:bg-transparent">
              <TableCell colSpan={2} className="font-semibold">
                Total keseluruhan
              </TableCell>
              <TableCell className="text-right font-semibold">
                {grandQty}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {grandQty}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
