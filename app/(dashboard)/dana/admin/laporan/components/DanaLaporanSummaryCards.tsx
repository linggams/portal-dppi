"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import { formatRupiah } from "@/lib/dana/format"
import type { DanaLaporanSummary } from "../types"

interface Props {
  summary: DanaLaporanSummary | null
}

export function DanaLaporanSummaryCards({ summary }: Props) {
  if (!summary) return null

  return (
    <CompactSummaryGrid>
      <SummaryMetric label="Total" value={summary.total} />
      <SummaryMetric label="Disetujui" value={summary.approved} />
      <SummaryMetric label="Ditolak" value={summary.rejected} />
      <SummaryMetric label="Pending" value={summary.pending} />
      <SummaryMetric
        label="Nominal disetujui"
        value={formatRupiah(summary.nominalDisetujui)}
      />
      <SummaryMetric
        label="Dana terpakai"
        value={formatRupiah(summary.danaTerpakai)}
      />
    </CompactSummaryGrid>
  )
}
