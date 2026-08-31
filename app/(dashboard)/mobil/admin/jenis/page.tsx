"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { TablePagination } from "@/components/ui/table-pagination"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { MobilJenis } from "@/lib/mobil/mobil-types"

export default function MobilJenisPage() {
  const [rows, setRows] = useState<MobilJenis[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MobilJenis | null>(null)
  const [nama, setNama] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      const res = await fetch(`/api/mobil/jenis?${params.toString()}`)
      if (!res.ok) throw new Error("Gagal memuat jenis")
      const result = readPaginatedJson<MobilJenis>(await res.json())
      setRows(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setPageSize(result.pageSize)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat")
      setRows([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const openCreate = () => {
    setEditing(null)
    setNama("")
    setKeterangan("")
    setOpen(true)
  }

  const openEdit = (row: MobilJenis) => {
    setEditing(row)
    setNama(row.nama)
    setKeterangan(row.keterangan)
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(
        editing ? `/api/mobil/jenis/${editing.idJenis}` : "/api/mobil/jenis",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, keterangan }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menyimpan"
        )
      }
      toast.success(editing ? "Jenis diperbarui" : "Jenis ditambahkan")
      setOpen(false)
      await fetchRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: MobilJenis) => {
    if (!confirm(`Hapus jenis "${row.nama}"?`)) return
    const res = await fetch(`/api/mobil/jenis/${row.idJenis}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(typeof data.error === "string" ? data.error : "Gagal menghapus")
      return
    }
    toast.success("Jenis dihapus")
    await fetchRows()
  }

  return (
    <DashboardLayout title="Data Jenis Kendaraan">
      <PageActions>
        <Button onClick={openCreate}>Tambah Jenis</Button>
      </PageActions>

      {loading ? (
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableEmptyState colSpan={3} title="Belum ada jenis kendaraan" />
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.idJenis}>
                      <TableCell className="font-medium">{row.nama}</TableCell>
                      <TableCell>{row.keterangan || "—"}</TableCell>
                      <TableCell className="text-right">
                        <TableActions>
                          <TableActionButton
                            label="Edit"
                            icon={Pencil}
                            onClick={() => openEdit(row)}
                          />
                          <TableActionButton
                            label="Hapus"
                            icon={Trash2}
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(row)}
                          />
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="jenis"
          />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Jenis" : "Tambah Jenis"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
