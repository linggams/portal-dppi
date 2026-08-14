"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  DashboardLayout,
  PageActions,
  PageSection,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
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
import { KembalianDialog } from "@/components/dana/KembalianDialog"
import { PengajuanDetailView } from "@/components/dana/PengajuanDetailView"
import {
  DANA_ALASAN_MAX,
  isDanaApprovable,
  isDanaKembalianEditable,
  isDanaPrintable,
} from "@/lib/dana/constants"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"
import { formatRupiah } from "@/lib/dana/format"

export default function AdminPengajuanDanaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [item, setItem] = useState<DanaPengajuan | null>(null)
  const [loading, setLoading] = useState(true)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [kembalianOpen, setKembalianOpen] = useState(false)
  const [alasan, setAlasan] = useState("")
  const [processing, setProcessing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dana/pengajuan/${id}`)
      if (!response.ok) throw new Error("Gagal memuat pengajuan")
      setItem(await response.json())
    } catch {
      setItem(null)
      toast.error("Pengajuan tidak ditemukan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleApprove = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/dana/pengajuan/${id}/approve`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menyetujui"
        )
      }
      toast.success("Pengajuan disetujui")
      setApproveOpen(false)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (alasan.trim().length < 3) return
    setProcessing(true)
    try {
      const response = await fetch(`/api/dana/pengajuan/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alasan: alasan.trim() }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          typeof data.error === "string" ? data.error : "Gagal menolak"
        )
      }
      toast.success("Pengajuan ditolak")
      setRejectOpen(false)
      setAlasan("")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak")
    } finally {
      setProcessing(false)
    }
  }

  const pending = item ? isDanaApprovable(item.status) : false

  return (
    <DashboardLayout title={item?.nomor ?? "Detail pengajuan"}>
      <PageActions>
        <Button asChild variant="outline">
          <Link href="/dana/admin/antrian">Kembali</Link>
        </Button>
        {pending ? (
          <>
            <Button variant="outline" onClick={() => setRejectOpen(true)}>
              Tolak
            </Button>
            <Button onClick={() => setApproveOpen(true)}>Setujui</Button>
          </>
        ) : null}
        {item && isDanaKembalianEditable(item.status) ? (
          <Button variant="outline" onClick={() => setKembalianOpen(true)}>
            Kembalian
          </Button>
        ) : null}
        {item && isDanaPrintable(item.status) ? (
          <Button onClick={() => downloadPengajuanDanaPdf(item)}>
            Cetak PDF
          </Button>
        ) : null}
      </PageActions>

      <PageSection>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : item ? (
          <PengajuanDetailView item={item} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Pengajuan tidak ditemukan.
          </p>
        )}
      </PageSection>

      <KembalianDialog
        open={kembalianOpen}
        onOpenChange={setKembalianOpen}
        item={item}
        onSubmit={async (kembalian) => {
          const response = await fetch(`/api/dana/pengajuan/${id}/kembalian`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kembalian }),
          })
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            toast.error(
              typeof data.error === "string"
                ? data.error
                : "Gagal menyimpan kembalian"
            )
            return false
          }
          toast.success("Kembalian disimpan")
          await load()
          return true
        }}
      />

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Setujui pengajuan?</AlertDialogTitle>
            <AlertDialogDescription>
              {item
                ? `${item.nomor} sebesar ${formatRupiah(item.nominal)} akan disetujui dan dapat dicetak PDF.`
                : "Pengajuan akan disetujui."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={processing}>
              {processing ? "Menyimpan..." : "Setujui"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open)
          if (!open) setAlasan("")
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Beri alasan penolakan agar pemohon dapat merevisi pengajuan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="alasan">Alasan</Label>
            <Textarea
              id="alasan"
              rows={3}
              maxLength={DANA_ALASAN_MAX}
              placeholder="Tuliskan alasan penolakan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing || alasan.trim().length < 3}
            >
              {processing ? "Menyimpan..." : "Tolak"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
