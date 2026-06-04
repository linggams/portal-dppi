"use client"

import { Ban } from "lucide-react"

import { useEffect, useState } from "react"
import { DashboardLayout, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { TableActionButton } from "@/components/ui/table-actions"

interface Kategori {
  idKategori: number
  nama: string
  aktif: boolean
}

export default function ItKategoriPage() {  const [kategori, setKategori] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [nama, setNama] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    fetch("/api/it/kategori?aktif=false")
      .then((r) => r.json())
      .then((data) => setKategori(Array.isArray(data) ? data : []))
      .catch(() => setKategori([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/it/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: nama.trim() }),
      })
      if (!res.ok) throw new Error()
      setNama("")
      load()
      toast.success("Kategori ditambahkan")
    } catch {
      toast.error("Gagal menambah kategori")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      const res = await fetch(`/api/it/kategori/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      load()
      toast.success("Kategori dinonaktifkan")
    } catch {
      toast.error("Gagal menonaktifkan kategori")
    }
  }

  return (
    <DashboardLayout title="Kategori Tiket">
      <SectionCard title="Tambah Kategori">
        <form
          onSubmit={handleAdd}
          className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="nama">Nama kategori</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Hardware, Jaringan"
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : "Tambah"}
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Daftar Kategori">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <TableContainer>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategori.length === 0 ? (
                <TableEmptyState colSpan={3} title="Tidak ada kategori" />
              ) : (
              kategori.map((k) => (
                <TableRow key={k.idKategori}>
                  <TableCell>{k.nama}</TableCell>
                  <TableCell>
                    {k.aktif ? (
                      <Badge>Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {k.aktif ? (
                      <TableActionButton label="Nonaktifkan" icon={Ban} onClick={() => handleDeactivate(k.idKategori)} />
                    ) : null}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </DashboardLayout>
  )
}
