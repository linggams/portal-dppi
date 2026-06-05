"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import type { PengajuanGroupsSummary } from "../types"

interface Props {
  summary: PengajuanGroupsSummary
}

export function PengajuanGroupSummary({ summary }: Props) {
  return (
    <CompactSummaryGrid>
      <SummaryMetric label="Total batch" value={summary.total} />
      <SummaryMetric label="Pending" value={summary.pending} />
      <SummaryMetric label="Disetujui" value={summary.approved} />
      <SummaryMetric label="Ditolak" value={summary.rejected} />
    </CompactSummaryGrid>
  )
}
