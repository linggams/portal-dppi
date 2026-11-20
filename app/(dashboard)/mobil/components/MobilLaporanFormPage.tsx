"use client"

import { useEffect, useMemo, useState, Fragment, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { DashboardLayout, PageActions, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { MOBIL_BUKTI_MAX_BYTES, MOBIL_BUKTI_MAX_MB, MOBIL_BUKTI_PLACEHOLDER } from "@/lib/mobil/upload-limits"
import { formatRupiah, parseRupiahInput } from "@/lib/shared/currency"
import type { MobilKendaraan } from "@/lib/mobil/mobil-types"

type TripDraft = {
  key: string
  dari: string
  jamDari: string
  ke: string
  jamKe: string
  km: string
  tol: number
  bukti: File | null
  previewUrl: string | null
  error: string
}

let tripKeySeq = 1
function nextTripKey() {
  tripKeySeq += 1
  return `trip-${tripKeySeq}`
}

function emptyTrip(key = nextTripKey()): TripDraft {
  return {
    key,
    dari: "",
    jamDari: "",
    ke: "",
    jamKe: "",
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
  if (!isJpg) return "File must be JPG"
  if (file.size > MOBIL_BUKTI_MAX_BYTES) return `Max photo size ${MOBIL_BUKTI_MAX_MB} MB`
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
        <DashboardLayout title="Log trip">
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
  const [uangJalan, setUangJalan] = useState(0)
  const [trips, setTrips] = useState<TripDraft[]>(() => [emptyTrip("trip-1")])
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
  const balanceUangJalan = uangJalan - totalTol
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
      (t) =>
        t.dari.trim() &&
        t.ke.trim() &&
        t.jamDari &&
        t.jamKe &&
        parseInt(t.km, 10) > 0 &&
        !t.error
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
      form.set("uangJalan", String(uangJalan))
      form.set(
        "perjalanan",
        JSON.stringify(
          trips.map((t) => ({
            dari: t.dari.trim(),
            jamDari: t.jamDari,
            ke: t.ke.trim(),
            jamKe: t.jamKe,
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
          typeof data.error === "string" ? data.error : "Failed to save"
        )
      }
      const created = await res.json()
      toast.success("Mileage report saved")
      router.push(`${detailHrefBase}/${created.idLaporan}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Log trip">
      <PageActions>
        <Button variant="outline" asChild>
          <Link href={listHref}>Back to list</Link>
        </Button>
        <Button type="submit" form="mobil-laporan-form" disabled={saving || !canSubmit}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </PageActions>

      <form id="mobil-laporan-form" onSubmit={handleSave}>
        <SectionCard title="Log trip">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vehicle *</Label>
                <Select value={idKendaraan} onValueChange={setIdKendaraan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
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
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Start KM</Label>
                <Input value={kmAwal.toLocaleString("id-ID")} disabled />
              </div>
              <div className="space-y-2">
                <Label>End KM</Label>
                <Input value={kmAkhir.toLocaleString("id-ID")} disabled />
                <p className="text-xs text-muted-foreground">
                  Auto = start KM + total trips
                </p>
              </div>
              <div className="space-y-2">
                <Label>Travel allowance</Label>
                <Input
                  inputMode="numeric"
                  value={uangJalan ? formatRupiah(uangJalan) : ""}
                  onChange={(e) =>
                    setUangJalan(parseRupiahInput(e.target.value))
                  }
                  placeholder="Rp 0"
                />
              </div>
              <div className="space-y-2">
                <Label>Total trip cost</Label>
                <Input value={formatRupiah(totalTol)} disabled />
                <p className="text-xs text-muted-foreground">
                  Sum of tolls for all trips
                </p>
              </div>
              <div className="space-y-2">
                <Label>Balance</Label>
                <Input value={formatRupiah(balanceUangJalan)} disabled />
                <p className="text-xs text-muted-foreground">
                  Travel allowance − total trip cost
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">Trips</h3>
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

              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead className="w-28">Time</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead className="w-28">Time</TableHead>
                      <TableHead className="w-24 text-right">KM</TableHead>
                      <TableHead className="w-36 text-right">Toll</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead className="w-[72px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.map((trip, index) => (
                      <Fragment key={trip.key}>
                        <TableRow>
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={trip.dari}
                              onChange={(e) =>
                                updateTrip(trip.key, { dari: e.target.value })
                              }
                              placeholder="Origin"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={trip.jamDari}
                              onChange={(e) =>
                                updateTrip(trip.key, { jamDari: e.target.value })
                              }
                              aria-label={`Departure time for trip ${index + 1}`}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={trip.ke}
                              onChange={(e) =>
                                updateTrip(trip.key, { ke: e.target.value })
                              }
                              placeholder="Destination"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={trip.jamKe}
                              onChange={(e) =>
                                updateTrip(trip.key, { jamKe: e.target.value })
                              }
                              aria-label={`Arrival time for trip ${index + 1}`}
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={trip.km}
                              onChange={(e) =>
                                updateTrip(trip.key, { km: e.target.value })
                              }
                              className="text-right"
                              placeholder="0"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              inputMode="numeric"
                              value={trip.tol ? formatRupiah(trip.tol) : ""}
                              onChange={(e) =>
                                updateTrip(trip.key, {
                                  tol: parseRupiahInput(e.target.value),
                                })
                              }
                              className="text-right"
                              placeholder="Rp 0"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-40 items-center gap-2">
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,image/jpeg"
                                className="min-w-0 flex-1"
                                placeholder={MOBIL_BUKTI_PLACEHOLDER}
                                onChange={(e) =>
                                  onPickBukti(trip.key, e.target.files?.[0] ?? null)
                                }
                              />
                              {trip.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={trip.previewUrl}
                                  alt={`Trip ${index + 1} preview`}
                                  className="size-9 shrink-0 rounded border object-cover"
                                />
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {trips.length > 1 ? (
                              <TableActions>
                                <TableActionButton
                                  label="Delete"
                                  icon={Trash2}
                                  className="text-destructive"
                                  onClick={() => removeTrip(trip.key)}
                                />
                              </TableActions>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        {trip.error ? (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className="py-1 text-sm text-destructive"
                            >
                              {trip.error}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button type="button" variant="outline" onClick={addTrip}>
                Add trip
              </Button>
            </div>
          </div>
        </SectionCard>
      </form>
    </DashboardLayout>
  )
}
