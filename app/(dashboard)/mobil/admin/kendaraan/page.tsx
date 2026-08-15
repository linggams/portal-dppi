"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"
import type { MobilJenis, MobilKendaraan } from "@/lib/mobil/mobil-types"

type FormState = {
  nopol: string
  idJenis: string
  kmAwal: string
  aktif: string
}

const emptyForm: FormState = {
  nopol: "",
  idJenis: "",
  kmAwal: "0",
  aktif: "true",
}

export default function MobilKendaraanPage() {
  const [rows, setRows] = useState<MobilKendaraan[]>([])
  const [jenis, setJenis] = useState<MobilJenis[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MobilKendaraan | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [kendaraanRes, jenisRes] = await Promise.all([
        fetch("/api/mobil/kendaraan"),
        fetch("/api/mobil/jenis"),
      ])
      if (!kendaraanRes.ok || !jenisRes.ok) {
        throw new Error("Gagal memuat data kendaraan")
      }
      setRows(await kendaraanRes.json())
      setJenis(await jenisRes.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (row: MobilKendaraan) => {
    setEditing(row)
    setForm({
      nopol: row.nopol,
      idJenis: String(row.idJenis),
      kmAwal: String(row.kmAwal),
      aktif: row.aktif ? "true" : "false",
    })
    setOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        nopol: form.nopol,
        idJenis: parseInt(form.idJenis, 10),
        kmAwal: parseInt(form.kmAwal, 10) || 0,
        aktif: form.aktif === "true",
      }
      const res = await fetch(
        editing
          ? `/api/mobil/kendaraan/${editing.idKendaraan}`
          : "/api/mobil/kendaraan",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menyimpan"
        )
      }
      toast.success(editing ? "Kendaraan diperbarui" : "Kendaraan ditambahkan")
      setOpen(false)
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: MobilKendaraan) => {
    if (!confirm(`Hapus kendaraan ${row.nopol}?`)) return
    const res = await fetch(`/api/mobil/kendaraan/${row.idKendaraan}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(typeof data.error === "string" ? data.error : "Gagal menghapus")
      return
    }
    toast.success("Kendaraan dihapus")
    await fetchAll()
  }

  return (
    <DashboardLayout title="Data Kendaraan">
      <PageActions>
        <Button onClick={openCreate}>Tambah Kendaraan</Button>
      </PageActions>

      {loading ? (
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nopol</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="text-right">KM terakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmptyState colSpan={5} title="Belum ada kendaraan" />
              ) : (
                rows.map((row) => (
                  <TableRow key={row.idKendaraan}>
                    <TableCell className="font-medium">{row.nopol}</TableCell>
                    <TableCell>{row.jenis?.nama ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {(row.kmTerakhir ?? row.kmAwal).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.aktif ? "default" : "secondary"}>
                        {row.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Kendaraan" : "Tambah Kendaraan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nopol</Label>
              <Input
                value={form.nopol}
                onChange={(e) => setForm({ ...form, nopol: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.idJenis}
                onValueChange={(idJenis) => setForm({ ...form, idJenis })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {jenis.map((j) => (
                    <SelectItem key={j.idJenis} value={String(j.idJenis)}>
                      {j.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>KM awal</Label>
              <Input
                type="number"
                min={0}
                value={form.kmAwal}
                onChange={(e) => setForm({ ...form, kmAwal: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.aktif}
                onValueChange={(aktif) => setForm({ ...form, aktif })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving || !form.idJenis}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
