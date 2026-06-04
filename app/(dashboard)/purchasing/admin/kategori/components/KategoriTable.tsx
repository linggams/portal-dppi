"use client"

import { Trash2 } from "lucide-react"
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
import type { Kategori } from "../types"
import { TableActionButton } from "@/components/ui/table-actions"

interface KategoriTableProps {
  data: Kategori[]
  onDelete: (item: Kategori) => void
}

export function KategoriTable({ data, onDelete }: KategoriTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Kategori</TableHead>
            <TableHead>Nama Kategori</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmptyState colSpan={3} title="Tidak ada data kategori" />
          ) : (
            data.map((item) => (
              <TableRow key={item.idJenis}>
                <TableCell>{item.idJenis}</TableCell>
                <TableCell>{item.jenisBrg}</TableCell>
                <TableCell className="text-right">
                  <TableActionButton label="Hapus" icon={Trash2} variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(item)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
