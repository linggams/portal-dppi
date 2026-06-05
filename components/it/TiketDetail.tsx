"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  ContentEmpty,
  PageActions,
  SectionCard,
  usePageTitle,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  IT_TIKET_STATUS,
  IT_TIKET_STATUS_LABEL,
  canManageItTiket,
  canUserCancelTiket,
} from "@/lib/it/constants"
import {
  formatRiwayatPesan,
  formatTiketDate,
  getStatusBadge,
} from "@/lib/it/utils"
import { isTiketInQueue } from "@/lib/it/queue"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Komentar {
  idKomentar: number
  username: string
  pesan: string
  tipe: string
  tglDibuat: string
}

interface Tiket {
  idTiket: number
  nomorTiket: string
  username: string
  jabatan: string
  judul: string
  deskripsi: string
  status: number
  ditugaskanKe: string | null
  tglDibuat: string
  tglDiupdate: string
  tglSelesai: string | null
  kategori: { idKategori: number; nama: string }
  komentar: Komentar[]
}

interface TiketDetailProps {
  tiketId: string
  backHref: string
  backLabel?: string
}

export function TiketDetail({
  tiketId,
  backHref,
  backLabel = "Kembali",
}: TiketDetailProps) {
  const { data: session } = useSession()
  const [tiket, setTiket] = useState<Tiket | null>(null)
  const [loading, setLoading] = useState(true)
  const [pesan, setPesan] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState<string>("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [antrianInfo, setAntrianInfo] = useState<{
    posisiAntrian: number
    totalAntrian: number
    antrianDiDepan: number
  } | null>(null)

  const isStaff = canManageItTiket(session?.user?.level ?? "")
  const isOwner = tiket?.username === session?.user?.username

  usePageTitle(tiket?.nomorTiket ?? "")

  const fetchTiket = useCallback(async () => {
    try {
      const res = await fetch(`/api/it/tiket/${tiketId}`)
      if (!res.ok) throw new Error("Gagal memuat tiket")
      const data = await res.json()
      setTiket(data)
      setStatusUpdate(String(data.status))
    } catch {
      toast.error("Gagal memuat detail tiket")
    } finally {
      setLoading(false)
    }
  }, [tiketId])

  useEffect(() => {
    setLoading(true)
    fetchTiket()
  }, [fetchTiket])

  useEffect(() => {
    if (!tiket || !isOwner || !isTiketInQueue(tiket.status)) {
      setAntrianInfo(null)
      return
    }
    fetch("/api/it/tiket/antrian")
      .then(async (r) => {
        if (!r.ok) return null
        const ct = r.headers.get("content-type") ?? ""
        if (!ct.includes("application/json")) return null
        return r.json()
      })
      .then((data) => {
        if (!data?.antrianSaya) return
        const item = data.antrianSaya.find(
          (a: { idTiket: number }) => a.idTiket === tiket.idTiket
        )
        if (item?.posisiAntrian != null) {
          setAntrianInfo({
            posisiAntrian: item.posisiAntrian,
            totalAntrian: item.totalAntrian,
            antrianDiDepan: item.antrianDiDepan ?? 0,
          })
        }
      })
      .catch(() => setAntrianInfo(null))
  }, [tiket, isOwner])

  const handleKomentar = async () => {
    if (!pesan.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/it/tiket/${tiketId}/komentar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan }),
      })
      if (!res.ok) throw new Error()
      setPesan("")
      await fetchTiket()
      toast.success("Komentar ditambahkan")
    } catch {
      toast.error("Gagal menambah komentar")
    } finally {
      setSubmitting(false)
    }
  }

  const patchTiket = async (body: Record<string, unknown>) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/it/tiket/${tiketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        const msg =
          typeof err.error === "string"
            ? err.error
            : "Gagal memperbarui"
        throw new Error(msg)
      }
      await fetchTiket()
      toast.success("Tiket diperbarui")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memperbarui tiket")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!tiket) {
    return <ContentEmpty title="Tiket tidak ditemukan" />
  }

  return (
    <div className="space-y-6">
      <PageActions><Button variant="outline" asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button></PageActions>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Detail Masalah">
            <p className="text-sm font-medium text-foreground">{tiket.judul}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {tiket.deskripsi}
            </p>
          </SectionCard>

          <SectionCard title="Riwayat">
            <div className="space-y-4">
              {tiket.komentar.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
              ) : (
                tiket.komentar.map((k) => (
                  <div
                    key={k.idKomentar}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {k.username}
                      </span>
                      <span>·</span>
                      <span>{formatTiketDate(k.tglDibuat)}</span>
                      {k.tipe !== "komentar" ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
                          {k.tipe}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm">{formatRiwayatPesan(k.pesan)}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          {(isOwner || isStaff) && tiket.status !== IT_TIKET_STATUS.DITUTUP ? (
            <SectionCard title="Tambah Komentar">
              <div className="space-y-3">
                <Textarea
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tulis komentar..."
                  rows={3}
                />
                <Button onClick={handleKomentar} disabled={submitting || !pesan.trim()}>
                  {submitting ? "Mengirim..." : "Kirim"}
                </Button>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-6">
          <SectionCard title="Informasi">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">{getStatusBadge(tiket.status)}</dd>
              </div>
              {isOwner && antrianInfo ? (
                <div>
                  <dt className="text-muted-foreground">Posisi Antrian</dt>
                  <dd className="mt-1 space-y-1">
                    <Badge variant="outline" className="font-mono">
                      Ke-{antrianInfo.posisiAntrian} dari {antrianInfo.totalAntrian}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {antrianInfo.antrianDiDepan > 0
                        ? `${antrianInfo.antrianDiDepan} tiket di depan Anda`
                        : "Tiket Anda di urutan terdepan antrian"}
                    </p>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Kategori</dt>
                <dd className="mt-1 font-medium">{tiket.kategori.nama}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Pelapor</dt>
                <dd className="mt-1 font-medium">
                  {tiket.username} ({tiket.jabatan})
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ditugaskan ke</dt>
                <dd className="mt-1 font-medium">
                  {tiket.ditugaskanKe ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dibuat</dt>
                <dd className="mt-1">{formatTiketDate(tiket.tglDibuat)}</dd>
              </div>
            </dl>
          </SectionCard>

          {isStaff ? (
            <SectionCard title="Aksi IT">
              <div className="space-y-4">
                {!tiket.ditugaskanKe ? (
                  <Button
                    className="w-full"
                    onClick={() => patchTiket({ action: "assign_self" })}
                    disabled={submitting}
                  >
                    Ambil Tiket
                  </Button>
                ) : null}

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IT_TIKET_STATUS_LABEL).map(([code, label]) => (
                        <SelectItem key={code} value={code}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() =>
                      patchTiket({ status: parseInt(statusUpdate) })
                    }
                    disabled={submitting}
                  >
                    Perbarui Status
                  </Button>
                </div>
              </div>
            </SectionCard>
          ) : null}

          {isOwner && tiket.status === IT_TIKET_STATUS.MENUNGGU_USER ? (
            <SectionCard title="Konfirmasi">
              <p className="mb-3 text-sm text-muted-foreground">
                IT menandai pekerjaan selesai. Konfirmasi jika masalah sudah teratasi.
              </p>
              <Button
                className="w-full"
                onClick={() => patchTiket({ action: "confirm_done" })}
                disabled={submitting}
              >
                Konfirmasi Selesai
              </Button>
            </SectionCard>
          ) : null}

          {isOwner && canUserCancelTiket(tiket.status) ? (
            <SectionCard title="Batalkan Tiket">
              <p className="mb-3 text-sm text-muted-foreground">
                Tiket masih berstatus Baru dan belum diproses tim IT. Anda dapat
                membatalkan pengajuan ini.
              </p>
              <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={submitting}>
                    Batalkan Tiket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Batalkan tiket?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tiket {tiket.nomorTiket} akan dibatalkan dan tidak lagi
                      masuk antrian IT. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        await patchTiket({ action: "cancel" })
                        setCancelOpen(false)
                      }}
                    >
                      Ya, batalkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
