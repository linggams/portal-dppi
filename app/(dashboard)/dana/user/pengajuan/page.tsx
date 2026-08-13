"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  ContentEmpty,
  DashboardLayout,
  PageActions,
  PageSection,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PengajuanFormDialog } from "@/components/dana/PengajuanFormDialog"
import { PengajuanTable } from "@/components/dana/PengajuanTable"
import { DANA_STATUS_LABEL } from "@/lib/dana/constants"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"
import { usePengajuanDana } from "../../hooks/usePengajuanDana"

export default function UserPengajuanDanaPage() {
  const {
    rows,
    loading,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    createPengajuan,
    revisePengajuan,
    cancelPengajuan,
  } = usePengajuanDana({ mine: true })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DanaPengajuan | null>(null)
  const [cancelTarget, setCancelTarget] = useState<DanaPengajuan | null>(null)
  const [cancelling, setCancelling] = useState(false)

  return (
    <DashboardLayout title="Pengajuan Dana">
      <PageActions>
        <Input
          placeholder="Cari nomor / keperluan"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-[220px]"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {Object.entries(DANA_STATUS_LABEL).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus />
          Ajukan
        </Button>
      </PageActions>

      <PageSection>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : rows.length === 0 ? (
          <ContentEmpty title="Belum ada pengajuan dana" />
        ) : (
          <PengajuanTable
            rows={rows}
            detailHref={(row) => `/dana/user/pengajuan/${row.idPengajuan}`}
            onRevise={(row) => {
              setEditing(row)
              setFormOpen(true)
            }}
            onCancel={setCancelTarget}
            onPrint={downloadPengajuanDanaPdf}
          />
        )}
      </PageSection>

      <PengajuanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSubmit={async (payload) => {
          if (editing) return revisePengajuan(editing.idPengajuan, payload)
          return createPengajuan(payload)
        }}
      />

      <AlertDialog
        open={cancelTarget != null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pengajuan?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `Pengajuan ${cancelTarget.nomor} akan dibatalkan dan tidak diproses pengelola.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Tutup</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelling}
              onClick={async () => {
                if (!cancelTarget) return
                setCancelling(true)
                const ok = await cancelPengajuan(cancelTarget.idPengajuan)
                setCancelling(false)
                if (ok) setCancelTarget(null)
              }}
            >
              {cancelling ? "Membatalkan..." : "Ya, batalkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
