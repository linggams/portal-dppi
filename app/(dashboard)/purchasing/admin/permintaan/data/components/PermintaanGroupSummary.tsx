"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import type { PermintaanGroupsSummary } from "../types"

interface Props {
  summary: PermintaanGroupsSummary
}

export function PermintaanGroupSummary({ summary }: Props) {
  return (
    <CompactSummaryGrid>
      <SummaryMetric label="Total batch" value={summary.total} />
      <SummaryMetric label="Pending" value={summary.pending} />
      <SummaryMetric label="Disetujui" value={summary.approved} />
      <SummaryMetric label="Ditolak" value={summary.rejected} />
    </CompactSummaryGrid>
  )
}
