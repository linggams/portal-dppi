"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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
import { TableActionButton, TableActions } from "@/components/ui/table-actions"
import { MOBIL_BUKTI_MAX_BYTES } from "@/lib/mobil/upload-limits"
import type { MobilKendaraan, MobilLaporanKm } from "@/lib/mobil/mobil-types"

const MAX_MB = MOBIL_BUKTI_MAX_BYTES / (1024 * 1024)

export default function MobilUserLaporanPage() {
  const [rows, setRows] = useState<MobilLaporanKm[]>([])
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [filterKendaraan, setFilterKendaraan] = useState("all")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<MobilLaporanKm | null>(null)

  const [idKendaraan, setIdKendaraan] = useState("")
  const [tanggal, setTanggal] = useState("")
  const [kmAwal, setKmAwal] = useState(0)
  const [kmAkhir, setKmAkhir] = useState("")
  const [keterangan, setKeterangan] = useState("")
  const [bukti, setBukti] = useState<File | null>(null)
  const [buktiError, setBuktiError] = useState("")

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ mine: "true" })
      if (filterKendaraan !== "all") {
        params.set("id_kendaraan", filterKendaraan)
      }
      const res = await fetch(`/api/mobil/laporan?${params.toString()}`)
      if (!res.ok) throw new Error("Gagal memuat laporan")
      setRows(await res.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [filterKendaraan])

  useEffect(() => {
    fetch("/api/mobil/kendaraan?aktif=true")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKendaraan(data) : setKendaraan([])))
      .catch(() => setKendaraan([]))
  }, [])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  useEffect(() => {
    if (!idKendaraan) {
      setKmAwal(0)
      return
    }
    fetch(`/api/mobil/balance?id_kendaraan=${idKendaraan}`)
      .then((r) => r.json())
      .then((data) => setKmAwal(Number(data.kmAwal) || 0))
      .catch(() => setKmAwal(0))
  }, [idKendaraan])

  const pemakaian = useMemo(() => {
    const akhir = parseInt(kmAkhir, 10)
    if (Number.isNaN(akhir)) return 0
    return Math.max(0, akhir - kmAwal)
  }, [kmAkhir, kmAwal])

  const balanceSummary = useMemo(() => {
    if (filterKendaraan === "all") return null
    const selected = kendaraan.find(
      (k) => String(k.idKendaraan) === filterKendaraan
    )
    const latest = rows[0]
    return {
      nopol: selected?.nopol ?? "—",
      balance: latest?.kmAkhir ?? selected?.kmTerakhir ?? selected?.kmAwal ?? 0,
      pemakaianBulan: rows.reduce((s, r) => s + r.pemakaian, 0),
    }
  }, [filterKendaraan, kendaraan, rows])

  const openForm = () => {
    const today = new Date().toISOString().split("T")[0]
    setIdKendaraan(filterKendaraan !== "all" ? filterKendaraan : "")
    setTanggal(today)
    setKmAkhir("")
    setKeterangan("")
    setBukti(null)
    setBuktiError("")
    setOpen(true)
  }

  const onPickBukti = (file: File | null) => {
    setBuktiError("")
    if (!file) {
      setBukti(null)
      return
    }
    const name = file.name.toLowerCase()
    const type = file.type.toLowerCase()
    const isJpg =
      type === "image/jpeg" ||
      type === "image/jpg" ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg")
    if (!isJpg) {
      setBukti(null)
      setBuktiError("File harus JPG")
      return
    }
    if (file.size > MOBIL_BUKTI_MAX_BYTES) {
      setBukti(null)
      setBuktiError(`Ukuran foto maksimal ${MAX_MB} MB`)
      return
    }
    setBukti(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bukti) {
      setBuktiError("Bukti foto wajib dilampirkan")
      return
    }
    setSaving(true)
    try {
      const form = new FormData()
      form.set("idKendaraan", idKendaraan)
      form.set("tanggal", tanggal)
      form.set("kmAkhir", kmAkhir)
      form.set("keterangan", keterangan)
      form.set("bukti", bukti)

      const res = await fetch("/api/mobil/laporan", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menyimpan"
        )
      }
      toast.success("Laporan KM tersimpan")
      setOpen(false)
      await fetchRows()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  const canSubmit =
    Boolean(idKendaraan && tanggal && kmAkhir && bukti) && !buktiError

  return (
    <DashboardLayout title="Input Laporan">
      <PageActions>
        <Select value={filterKendaraan} onValueChange={setFilterKendaraan}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Kendaraan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kendaraan</SelectItem>
            {kendaraan.map((k) => (
              <SelectItem key={k.idKendaraan} value={String(k.idKendaraan)}>
                {k.nopol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openForm}>Input Laporan</Button>
      </PageActions>

      {balanceSummary ? (
        <div className="rounded-md border px-4 py-3 text-sm">
          <span className="font-medium">{balanceSummary.nopol}</span>
          {" · "}
          Balance{" "}
          <span className="font-medium">
            {balanceSummary.balance.toLocaleString("id-ID")} KM
          </span>
          {" · "}
          Pemakaian daftar ini{" "}
          <span className="font-medium">
            {balanceSummary.pemakaianBulan.toLocaleString("id-ID")} KM
          </span>
        </div>
      ) : null}

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
                <TableHead>Tanggal</TableHead>
                <TableHead>Nopol</TableHead>
                <TableHead className="text-right">KM awal</TableHead>
                <TableHead className="text-right">KM akhir</TableHead>
                <TableHead className="text-right">Pemakaian</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmptyState colSpan={6} title="Belum ada laporan KM" />
              ) : (
                rows.map((row) => (
                  <TableRow key={row.idLaporan}>
                    <TableCell>{row.tanggal}</TableCell>
                    <TableCell className="font-medium">
                      {row.kendaraan?.nopol ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.kmAwal.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.kmAkhir.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.pemakaian.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <TableActions>
                        <TableActionButton
                          label="Lihat bukti"
                          icon={Eye}
                          onClick={() => setPreview(row)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Input Laporan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Kendaraan</Label>
              <Select value={idKendaraan} onValueChange={setIdKendaraan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  {kendaraan.map((k) => (
                    <SelectItem key={k.idKendaraan} value={String(k.idKendaraan)}>
                      {k.nopol}
                      {k.jenis?.nama ? ` — ${k.jenis.nama}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>KM awal</Label>
                <Input value={kmAwal.toLocaleString("id-ID")} disabled />
              </div>
              <div className="space-y-2">
                <Label>KM akhir</Label>
                <Input
                  type="number"
                  min={kmAwal}
                  value={kmAkhir}
                  onChange={(e) => setKmAkhir(e.target.value)}
                  required
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pemakaian:{" "}
              <span className="font-medium text-foreground">
                {pemakaian.toLocaleString("id-ID")} KM
              </span>
            </p>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Bukti foto dashboard (JPG, maks {MAX_MB} MB) *</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(e) => onPickBukti(e.target.files?.[0] ?? null)}
              />
              {bukti ? (
                <p className="text-xs text-muted-foreground">
                  {bukti.name} · {(bukti.size / 1024).toFixed(0)} KB
                </p>
              ) : null}
              {buktiError ? (
                <p className="text-sm text-destructive">{buktiError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving || !canSubmit}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Dashboard</DialogTitle>
          </DialogHeader>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.buktiPath}
              alt="Bukti dashboard"
              className="max-h-[70vh] w-full rounded-md border object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
