"use client"

import { useState } from "react"
import {
  ContentEmpty,
  DashboardLayout,
  PageActions,
  PageSection,
} from "@/components/layout"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { KembalianDialog } from "@/components/dana/KembalianDialog"
import { PengajuanTable } from "@/components/dana/PengajuanTable"
import { DANA_STATUS_LABEL } from "@/lib/dana/constants"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"
import { usePengajuanDana } from "../../hooks/usePengajuanDana"

export default function AdminListPengajuanDanaPage() {
  const {
    rows,
    loading,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    saveKembalian,
  } = usePengajuanDana()
  const [kembalianTarget, setKembalianTarget] = useState<DanaPengajuan | null>(
    null
  )

  return (
    <DashboardLayout title="List Pengajuan">
      <PageActions>
        <Input
          placeholder="Cari pemohon / nomor"
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
      </PageActions>

      <PageSection>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : rows.length === 0 ? (
          <ContentEmpty title="Tidak ada pengajuan dana" />
        ) : (
          <PengajuanTable
            rows={rows}
            showPemohon
            detailHref={(row) => `/dana/admin/antrian/${row.idPengajuan}`}
            onKembalian={setKembalianTarget}
            onPrint={downloadPengajuanDanaPdf}
          />
        )}
      </PageSection>

      <KembalianDialog
        open={kembalianTarget != null}
        onOpenChange={(open) => !open && setKembalianTarget(null)}
        item={kembalianTarget}
        onSubmit={async (kembalian) => {
          if (!kembalianTarget) return false
          return saveKembalian(kembalianTarget.idPengajuan, kembalian)
        }}
      />
    </DashboardLayout>
  )
}
