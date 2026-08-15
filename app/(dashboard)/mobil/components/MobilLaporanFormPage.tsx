"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout, PageActions, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOBIL_BUKTI_MAX_BYTES } from "@/lib/mobil/upload-limits"
import { formatRupiah, parseRupiahInput } from "@/lib/dana/format"
import type { MobilKendaraan } from "@/lib/mobil/mobil-types"

const MAX_MB = MOBIL_BUKTI_MAX_BYTES / (1024 * 1024)

type TripDraft = {
  key: string
  dari: string
  ke: string
  km: string
  tol: number
  bukti: File | null
  previewUrl: string | null
  error: string
}

function emptyTrip(): TripDraft {
  return {
    key: crypto.randomUUID(),
    dari: "",
    ke: "",
    km: "",
    tol: 0,
    bukti: null,
    previewUrl: null,
    error: "",
  }
}

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

export function MobilLaporanFormPage({
  listHref,
  detailHrefBase,
}: {
  listHref: string
  detailHrefBase: string
}) {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Input Laporan">
          <div className="space-y-3 rounded-md border p-4">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded bg-muted" />
          </div>
        </DashboardLayout>
      }
    >
      <MobilLaporanForm listHref={listHref} detailHrefBase={detailHrefBase} />
    </Suspense>
  )
}

function MobilLaporanForm({
  listHref,
  detailHrefBase,
}: {
  listHref: string
  detailHrefBase: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [idKendaraan, setIdKendaraan] = useState("")
  const [tanggal, setTanggal] = useState("")
  const [kmAwal, setKmAwal] = useState(0)
  const [trips, setTrips] = useState<TripDraft[]>([emptyTrip()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setTanggal(today)
    const preselect = searchParams.get("kendaraan")
    if (preselect) setIdKendaraan(preselect)

    fetch("/api/mobil/kendaraan?aktif=true")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKendaraan(data) : setKendaraan([])))
      .catch(() => setKendaraan([]))
  }, [searchParams])

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

  useEffect(() => {
    return () => {
      for (const trip of trips) {
        if (trip.previewUrl) URL.revokeObjectURL(trip.previewUrl)
      }
    }
    // only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalKm = useMemo(
    () =>
      trips.reduce((sum, trip) => {
        const km = parseInt(trip.km, 10)
        return sum + (Number.isNaN(km) || km < 0 ? 0 : km)
      }, 0),
    [trips]
  )
  const totalTol = useMemo(
    () => trips.reduce((sum, trip) => sum + trip.tol, 0),
    [trips]
  )
  const kmAkhir = kmAwal + totalKm

  const updateTrip = (key: string, patch: Partial<TripDraft>) => {
    setTrips((prev) =>
      prev.map((trip) => (trip.key === key ? { ...trip, ...patch } : trip))
    )
  }

  const onPickBukti = (key: string, file: File | null) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.key !== key) return trip
        if (trip.previewUrl) URL.revokeObjectURL(trip.previewUrl)
        if (!file) {
          return { ...trip, bukti: null, previewUrl: null, error: "" }
        }
        const error = validateJpg(file)
        if (error) {
          return { ...trip, bukti: null, previewUrl: null, error }
        }
        return {
          ...trip,
          bukti: file,
          previewUrl: URL.createObjectURL(file),
          error: "",
        }
      })
    )
  }

  const addTrip = () => setTrips((prev) => [...prev, emptyTrip()])

  const removeTrip = (key: string) => {
    setTrips((prev) => {
      if (prev.length <= 1) return prev
      const target = prev.find((t) => t.key === key)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((t) => t.key !== key)
    })
  }

  const canSubmit =
    Boolean(idKendaraan && tanggal) &&
    trips.every(
      (t) => t.dari.trim() && t.ke.trim() && parseInt(t.km, 10) > 0 && !t.error
    ) &&
    totalKm > 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    try {
      const form = new FormData()
      form.set("idKendaraan", idKendaraan)
      form.set("tanggal", tanggal)
      form.set(
        "perjalanan",
        JSON.stringify(
          trips.map((t) => ({
            dari: t.dari.trim(),
            ke: t.ke.trim(),
            km: parseInt(t.km, 10),
            tol: t.tol,
          }))
        )
      )
      trips.forEach((trip, index) => {
        if (trip.bukti) form.set(`bukti_${index}`, trip.bukti)
      })

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
      const created = await res.json()
      toast.success("Laporan KM tersimpan")
      router.push(`${detailHrefBase}/${created.idLaporan}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Input Laporan">
      <PageActions>
        <Button variant="outline" asChild>
          <Link href={listHref}>Kembali ke daftar</Link>
        </Button>
        <Button type="submit" form="mobil-laporan-form" disabled={saving || !canSubmit}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </PageActions>

      <form id="mobil-laporan-form" onSubmit={handleSave}>
        <SectionCard title="Input Laporan">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kendaraan *</Label>
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
                <Label>Tanggal *</Label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>KM awal</Label>
                <Input value={kmAwal.toLocaleString("id-ID")} disabled />
              </div>
              <div className="space-y-2">
                <Label>KM akhir</Label>
                <Input value={kmAkhir.toLocaleString("id-ID")} disabled />
                <p className="text-xs text-muted-foreground">
                  Otomatis = KM awal + total perjalanan
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">Perjalanan</h3>
                <p className="text-sm text-muted-foreground">
                  Total{" "}
                  <span className="font-medium text-foreground">
                    {totalKm.toLocaleString("id-ID")} KM
                  </span>
                  {" · "}
                  Tol{" "}
                  <span className="font-medium text-foreground">
                    {formatRupiah(totalTol)}
                  </span>
                </p>
              </div>

              <div className="hidden gap-2 px-1 text-xs text-muted-foreground lg:grid lg:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_5.5rem_minmax(7.5rem,9rem)_minmax(11rem,14rem)_2.5rem]">
                <span>#</span>
                <span>Dari *</span>
                <span>Ke *</span>
                <span>KM *</span>
                <span>Tol</span>
                <span>Bukti (JPG, maks {MAX_MB} MB)</span>
                <span className="sr-only">Aksi</span>
              </div>

              <div className="space-y-2">
                {trips.map((trip, index) => (
                  <div key={trip.key} className="space-y-1">
                    <div className="grid grid-cols-1 items-end gap-2 rounded-md border p-3 lg:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_5.5rem_minmax(7.5rem,9rem)_minmax(11rem,14rem)_2.5rem] lg:items-center lg:gap-2 lg:p-2">
                      <span className="text-sm font-medium text-muted-foreground lg:text-center">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <Label className="lg:hidden">Dari *</Label>
                        <Input
                          value={trip.dari}
                          onChange={(e) =>
                            updateTrip(trip.key, { dari: e.target.value })
                          }
                          placeholder="Asal"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="lg:hidden">Ke *</Label>
                        <Input
                          value={trip.ke}
                          onChange={(e) =>
                            updateTrip(trip.key, { ke: e.target.value })
                          }
                          placeholder="Tujuan"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="lg:hidden">KM *</Label>
                        <Input
                          type="number"
                          min={1}
                          value={trip.km}
                          onChange={(e) =>
                            updateTrip(trip.key, { km: e.target.value })
                          }
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="lg:hidden">Tol</Label>
                        <Input
                          inputMode="numeric"
                          value={trip.tol ? formatRupiah(trip.tol) : ""}
                          onChange={(e) =>
                            updateTrip(trip.key, {
                              tol: parseRupiahInput(e.target.value),
                            })
                          }
                          placeholder="Rp 0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="lg:hidden">
                          Bukti (JPG, maks {MAX_MB} MB)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,image/jpeg"
                            className="min-w-0 flex-1"
                            onChange={(e) =>
                              onPickBukti(trip.key, e.target.files?.[0] ?? null)
                            }
                          />
                          {trip.previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={trip.previewUrl}
                              alt={`Preview perjalanan ${index + 1}`}
                              className="size-9 shrink-0 rounded border object-cover"
                            />
                          ) : null}
                        </div>
                      </div>
                      <div className="flex justify-end lg:justify-center">
                        {trips.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            aria-label={`Hapus perjalanan ${index + 1}`}
                            onClick={() => removeTrip(trip.key)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : (
                          <span className="hidden size-8 lg:block" />
                        )}
                      </div>
                    </div>
                    {trip.error ? (
                      <p className="px-1 text-sm text-destructive">{trip.error}</p>
                    ) : null}
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" onClick={addTrip}>
                <Plus className="size-4" />
                Tambah perjalanan
              </Button>
            </div>
          </div>
        </SectionCard>
      </form>
    </DashboardLayout>
  )
}
