"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout, PageActions, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { formatRupiah, parseRupiahInput } from "@/lib/dana/format"
import { MOBIL_BUKTI_MAX_BYTES } from "@/lib/mobil/upload-limits"
import type { MobilLaporanKm } from "@/lib/mobil/mobil-types"

const MAX_MB = MOBIL_BUKTI_MAX_BYTES / (1024 * 1024)

function validateJpg(file: File): string | null {
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  const isJpg =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  if (!isJpg) return "File harus JPG"
  if (file.size > MOBIL_BUKTI_MAX_BYTES) return `Ukuran foto maksimal ${MAX_MB} MB`
  return null
}

export function MobilLaporanDetailPage({
  params,
  backHref,
  title = "Detail Laporan",
}: {
  params: Promise<{ id: string }>
  backHref: string
  title?: string
}) {
  const { id } = use(params)
  const [item, setItem] = useState<MobilLaporanKm | null>(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [dari, setDari] = useState("")
  const [jamDari, setJamDari] = useState("")
  const [ke, setKe] = useState("")
  const [jamKe, setJamKe] = useState("")
  const [km, setKm] = useState("")
  const [tol, setTol] = useState(0)
  const [bukti, setBukti] = useState<File | null>(null)
  const [buktiError, setBuktiError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/mobil/laporan/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Laporan tidak ditemukan")
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setItem(data)
      })
      .catch(() => {
        if (!cancelled) {
          setItem(null)
          toast.error("Laporan tidak ditemukan")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const resetAddForm = () => {
    setDari("")
    setJamDari("")
    setKe("")
    setJamKe("")
    setKm("")
    setTol(0)
    setBukti(null)
    setBuktiError("")
  }

  const openAddDialog = () => {
    resetAddForm()
    setOpenAdd(true)
  }

  const canSubmitAdd =
    Boolean(
      dari.trim() &&
        ke.trim() &&
        jamDari &&
        jamKe &&
        parseInt(km, 10) > 0
    ) && !buktiError

  const handleAddPerjalanan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmitAdd) return
    setSaving(true)
    try {
      const form = new FormData()
      form.set("dari", dari.trim())
      form.set("jamDari", jamDari)
      form.set("ke", ke.trim())
      form.set("jamKe", jamKe)
      form.set("km", String(parseInt(km, 10)))
      form.set("tol", String(tol))
      if (bukti) form.set("bukti", bukti)

      const res = await fetch(`/api/mobil/laporan/${id}`, {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menambah perjalanan"
        )
      }
      const updated = await res.json()
      setItem(updated)
      setOpenAdd(false)
      resetAddForm()
      toast.success("Perjalanan ditambahkan")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambah perjalanan"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title={title}>
      <PageActions>
        <Button variant="outline" asChild>
          <Link href={backHref}>Kembali</Link>
        </Button>
      </PageActions>

      {loading ? (
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !item ? (
        <p className="text-sm text-muted-foreground">Laporan tidak ditemukan.</p>
      ) : (
        <div className="space-y-4">
          <SectionCard title={`${item.kendaraan?.nopol ?? "—"} · ${item.tanggal}`}>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                Pelapor: <span className="font-medium">{item.username}</span>
                {item.jabatan ? ` · ${item.jabatan}` : ""}
              </p>
              <p>
                Perjalanan:{" "}
                <span className="font-medium">{item.jumlahPerjalanan}</span>
              </p>
              <p>
                KM:{" "}
                <span className="font-medium">
                  {item.kmAwal.toLocaleString("id-ID")} →{" "}
                  {item.kmAkhir.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Pemakaian:{" "}
                <span className="font-medium">
                  {item.pemakaian.toLocaleString("id-ID")} KM
                </span>
              </p>
              <p>
                Total tol:{" "}
                <span className="font-medium">{formatRupiah(item.totalTol)}</span>
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Perjalanan"
            action={
              <Button type="button" size="sm" onClick={openAddDialog}>
                Tambah perjalanan
              </Button>
            }
          >
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Dari</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Ke</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead className="text-right">KM</TableHead>
                    <TableHead className="text-right">Tol</TableHead>
                    <TableHead className="text-right">Bukti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.perjalanan.length === 0 ? (
                    <TableEmptyState colSpan={8} title="Tidak ada perjalanan" />
                  ) : (
                    item.perjalanan.map((trip) => (
                      <TableRow key={trip.idPerjalanan}>
                        <TableCell>{trip.urutan}</TableCell>
                        <TableCell>{trip.dari}</TableCell>
                        <TableCell>{trip.jamDari}</TableCell>
                        <TableCell>{trip.ke}</TableCell>
                        <TableCell>{trip.jamKe}</TableCell>
                        <TableCell className="text-right">
                          {trip.km.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(trip.tol)}
                        </TableCell>
                        <TableCell className="text-right">
                          {trip.buktiPath ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreview(trip.buktiPath)}
                            >
                              Lihat penuh
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </div>
      )}

      <Dialog
        open={openAdd}
        onOpenChange={(next) => {
          setOpenAdd(next)
          if (!next) resetAddForm()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah perjalanan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPerjalanan} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dari">Dari *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dari"
                    value={dari}
                    onChange={(e) => setDari(e.target.value)}
                    placeholder="Asal"
                    className="min-w-0 flex-1"
                    required
                  />
                  <Input
                    id="jamDari"
                    type="time"
                    value={jamDari}
                    onChange={(e) => setJamDari(e.target.value)}
                    className="w-[7.5rem] shrink-0"
                    aria-label="Jam dari"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ke">Ke *</Label>
                <div className="flex gap-2">
                  <Input
                    id="ke"
                    value={ke}
                    onChange={(e) => setKe(e.target.value)}
                    placeholder="Tujuan"
                    className="min-w-0 flex-1"
                    required
                  />
                  <Input
                    id="jamKe"
                    type="time"
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    className="w-[7.5rem] shrink-0"
                    aria-label="Jam ke"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="km">KM *</Label>
                  <Input
                    id="km"
                    type="number"
                    min={1}
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tol">Tol</Label>
                  <Input
                    id="tol"
                    inputMode="numeric"
                    value={tol ? formatRupiah(tol) : ""}
                    onChange={(e) => setTol(parseRupiahInput(e.target.value))}
                    placeholder="Rp 0"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bukti">Bukti (JPG, maks {MAX_MB} MB)</Label>
              <Input
                id="bukti"
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  if (!file) {
                    setBukti(null)
                    setBuktiError("")
                    return
                  }
                  const error = validateJpg(file)
                  if (error) {
                    setBukti(null)
                    setBuktiError(error)
                    return
                  }
                  setBukti(file)
                  setBuktiError("")
                }}
              />
              {buktiError ? (
                <p className="text-sm text-destructive">{buktiError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAdd(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving || !canSubmitAdd}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Bukti perjalanan"
            className="max-h-[90vh] max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}
