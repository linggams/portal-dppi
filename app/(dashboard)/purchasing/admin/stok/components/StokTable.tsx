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
  onEdit: (stok: StokBarang) => void
  onDelete: (stok: StokBarang) => void
}

export function StokTable({ data, onEdit, onDelete }: StokTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Kode Barang</TableHead>
            <TableHead>Nama Barang</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Keluar</TableHead>
            <TableHead>Sisa</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmptyState colSpan={9} title="Tidak ada data stok barang" />
          ) : (
            data.map((stok, index) => (
              <TableRow key={stok.idKodeBrg}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{stok.kodeBrg}</TableCell>
                <TableCell>{stok.namaBrg}</TableCell>
                <TableCell>{formatRupiah(stok.hargabarang)}</TableCell>
                <TableCell>{stok.satuan}</TableCell>
                <TableCell>{stok.stok}</TableCell>
                <TableCell>{stok.keluar}</TableCell>
                <TableCell
                  className={
                    stok.sisa < 0
                      ? "text-destructive font-semibold"
                      : stok.sisa === 0
                        ? "text-amber-600 dark:text-amber-500 font-semibold"
                        : ""
                  }
                >
                  {stok.sisa}
                </TableCell>
                <TableCell className="text-right pdf-hidden">
                  <TableActions>
                    <TableActionButton label="Edit" icon={Pencil} onClick={() => onEdit(stok)} />
                    <TableActionButton label="Hapus" icon={Trash2} className="text-destructive hover:text-destructive" onClick={() => onDelete(stok)} />
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
