"use client"

import {
  ContentEmpty,
  DashboardLayout,
  PageSection,
} from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"
import { PengajuanTable } from "@/components/dana/PengajuanTable"
import { DANA_STATUS } from "@/lib/dana/constants"
import { downloadPengajuanDanaPdf } from "@/lib/dana/pdf"
import { usePengajuanDana } from "../../hooks/usePengajuanDana"

export default function UserCetakDanaPage() {
  const { rows, loading } = usePengajuanDana({
    mine: true,
    initialStatus: String(DANA_STATUS.APPROVED),
  })

  return (
    <DashboardLayout title="Cetak Pengajuan Dana">
      <PageSection>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : rows.length === 0 ? (
          <ContentEmpty
            title="Belum ada pengajuan disetujui"
            description="PDF hanya dapat dicetak setelah pengelola menyetujui pengajuan."
          />
        ) : (
          <PengajuanTable
            rows={rows}
            detailHref={(row) => `/dana/user/pengajuan/${row.idPengajuan}`}
            onPrint={downloadPengajuanDanaPdf}
          />
        )}
      </PageSection>
    </DashboardLayout>
  )
}
