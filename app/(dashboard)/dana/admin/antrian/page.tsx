"use client"

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
import { PengajuanTable } from "@/components/dana/PengajuanTable"
import { DANA_STATUS, DANA_STATUS_LABEL } from "@/lib/dana/constants"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"
import { usePengajuanDana } from "../../hooks/usePengajuanDana"

export default function AdminAntrianDanaPage() {
  const { rows, loading, statusFilter, setStatusFilter, query, setQuery } =
    usePengajuanDana({
      initialStatus: String(DANA_STATUS.PENDING),
    })

  return (
    <DashboardLayout title="Antrian Pengajuan Dana">
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
            onPrint={downloadPengajuanDanaPdf}
          />
        )}
      </PageSection>
    </DashboardLayout>
  )
}
