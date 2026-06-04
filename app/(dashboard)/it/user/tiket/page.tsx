"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, XCircle } from "lucide-react"
import { toast } from "sonner"
import { ContentEmpty, DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TableActionButton,
  TableActionLink,
  TableActions,
} from "@/components/ui/table-actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { canUserCancelTiket } from "@/lib/it/constants"
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
import {
  formatTiketDate,
  getPrioritasBadge,
  getStatusBadge,
} from "@/lib/it/utils"

interface TiketRow {
  idTiket: number
  nomorTiket: string
  judul: string
  prioritas: string
  status: number
  tglDibuat: string
  kategori: { nama: string }
  posisiAntrian?: number | null
  totalAntrian?: number
  antrianDiDepan?: number | null
}

type AntrianQueueItem = {
  idTiket: number
  posisiAntrian: number | null
  totalAntrian: number
  antrianDiDepan: number | null
}

export default function UserTiketPage() {
  const [tiket, setTiket] = useState<TiketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<TiketRow | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const loadTiket = async () => {
      try {
        const [mineRes, antrianRes] = await Promise.all([
          fetch("/api/it/tiket?mine=true"),
          fetch("/api/it/tiket/antrian"),
        ])

        let rows: TiketRow[] = []
        if (mineRes.ok) {
          const ct = mineRes.headers.get("content-type") ?? ""
          if (ct.includes("application/json")) {
            const data = await mineRes.json()
            rows = Array.isArray(data) ? data : []
          }
        }

        if (antrianRes.ok) {
          const ct = antrianRes.headers.get("content-type") ?? ""
          if (ct.includes("application/json")) {
            const antrian = await antrianRes.json()
            const map = new Map<number, AntrianQueueItem>(
              (antrian.antrianSaya ?? []).map((a: AntrianQueueItem) => [
                a.idTiket,
                a,
              ])
            )
            rows = rows.map((t) => {
              const q = map.get(t.idTiket)
              if (!q) return t
              return {
                ...t,
                posisiAntrian: q.posisiAntrian,
                totalAntrian: q.totalAntrian,
                antrianDiDepan: q.antrianDiDepan,
              }
            })
          }
        }

        setTiket(rows)
      } catch {
        setTiket([])
      } finally {
        setLoading(false)
      }
  }

  useEffect(() => {
    setLoading(true)
    loadTiket()
  }, [])

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/it/tiket/${cancelTarget.idTiket}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(
          typeof err.error === "string" ? err.error : "Gagal membatalkan tiket"
        )
      }
      toast.success("Tiket dibatalkan")
      setCancelTarget(null)
      await loadTiket()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membatalkan tiket")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <DashboardLayout title="Tiket Saya">
      <PageActions>
        <Button asChild variant="outline">
          <Link href="/it/user/antrian">Antrian Tiket</Link>
        </Button>
        <Button asChild>
          <Link href="/it/user/tiket/buat">Buat Tiket</Link>
        </Button>
      </PageActions>

      {loading ? (
        <Skeleton className="h-40 w-full rounded-md" />
      ) : tiket.length === 0 ? (
        <ContentEmpty
          title="Belum ada tiket"
          description="Buat tiket baru jika Anda membutuhkan bantuan IT"
        />
      ) : (
        <TableContainer>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Tiket</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Antrian</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiket.map((t) => (
                <TableRow key={t.idTiket}>
                  <TableCell className="font-medium">{t.nomorTiket}</TableCell>
                  <TableCell>{t.judul}</TableCell>
                  <TableCell>{t.kategori.nama}</TableCell>
                  <TableCell>{getPrioritasBadge(t.prioritas)}</TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell>
                    {t.posisiAntrian != null && t.totalAntrian != null ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        Ke-{t.posisiAntrian}/{t.totalAntrian}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatTiketDate(t.tglDibuat)}</TableCell>
                  <TableCell className="text-right">
                    <TableActions>
                      <TableActionLink
                        label="Detail"
                        icon={Eye}
                        href={`/it/user/tiket/${t.idTiket}`}
                      />
                      {canUserCancelTiket(t.status) ? (
                        <TableActionButton
                          label="Batalkan"
                          icon={XCircle}
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCancelTarget(t)}
                        />
                      ) : null}
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
        </TableContainer>
      )}

      <AlertDialog
        open={cancelTarget != null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan tiket?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `Tiket ${cancelTarget.nomorTiket} akan dibatalkan dan tidak lagi masuk antrian IT.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Tutup</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? "Membatalkan..." : "Ya, batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
