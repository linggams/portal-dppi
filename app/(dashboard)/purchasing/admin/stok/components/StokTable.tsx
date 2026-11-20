"use client"

import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { formatRupiah } from "../utils"
import type { StokBarang } from "../types"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"

interface StokTableProps {
  data: StokBarang[]
  rowOffset?: number
  onEdit: (stok: StokBarang) => void
  onDelete: (stok: StokBarang) => void
}

export function StokTable({
  data,
  rowOffset = 0,
  onEdit,
  onDelete,
}: StokTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Item code</TableHead>
            <TableHead>Item name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Out</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmptyState colSpan={9} title="No item stock data" />
          ) : (
            data.map((stok, index) => (
              <TableRow key={stok.idKodeBrg}>
                <TableCell>{rowOffset + index + 1}</TableCell>
                <TableCell>{stok.kodeBrg}</TableCell>
                <TableCell>{stok.namaBrg}</TableCell>
                <TableCell>{formatRupiah(stok.hargabarang)}</TableCell>
                <TableCell>{stok.satuan}</TableCell>
                <TableCell>{stok.stok}</TableCell>
                <TableCell>{stok.keluar}</TableCell>
                <TableCell
                  className={
                    stok.sisa <= 0 ? "font-semibold text-destructive" : ""
                  }
                >
                  {stok.sisa}
                </TableCell>
                <TableCell className="text-right pdf-hidden">
                  <TableActions>
                    <TableActionButton label="Edit" icon={Pencil} onClick={() => onEdit(stok)} />
                    <TableActionButton label="Delete" icon={Trash2} className="text-destructive hover:text-destructive" onClick={() => onDelete(stok)} />
                  </TableActions>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
