"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  DashboardLayout,
  PageActions,
  PageSection,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { PengajuanDetailView } from "@/components/dana/PengajuanDetailView"
import { PengajuanFormDialog } from "@/components/dana/PengajuanFormDialog"
import {
  isDanaCancellable,
  isDanaEditable,
  isDanaPrintable,
} from "@/lib/dana/constants"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"

export default function UserPengajuanDanaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<DanaPengajuan | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

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

  const handleRevise = async (payload: {
    nominal: number
    keperluan: string
  }) => {
    const response = await fetch(`/api/dana/pengajuan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      toast.error("Gagal menyimpan revisi")
      return false
    }
    toast.success("Revisi pengajuan disimpan")
    await load()
    return true
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/dana/pengajuan/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      if (!response.ok) throw new Error("Gagal membatalkan")
      toast.success("Pengajuan dibatalkan")
      setCancelOpen(false)
      router.push("/dana/user/pengajuan")
    } catch {
      toast.error("Gagal membatalkan pengajuan")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <DashboardLayout title={item?.nomor ?? "Detail pengajuan"}>
      <PageActions>
        <Button asChild variant="outline">
          <Link href="/dana/user/pengajuan">Kembali</Link>
        </Button>
        {item && isDanaEditable(item.status) ? (
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            Revisi
          </Button>
        ) : null}
        {item && isDanaCancellable(item.status) ? (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            Batalkan
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

      <PengajuanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={item}
        onSubmit={handleRevise}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pengajuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengajuan {item?.nomor} akan dibatalkan dan tidak dapat diproses
              pengelola.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Tutup</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Membatalkan..." : "Ya, batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
