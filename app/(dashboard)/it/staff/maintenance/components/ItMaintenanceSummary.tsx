"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import type { MaintenanceSummaryData } from "../types"

interface Props {
  summary: MaintenanceSummaryData | null
}

export function ItMaintenanceSummary({ summary }: Props) {
  if (!summary) return null

  return (
    <CompactSummaryGrid>
      <SummaryMetric label="Total" value={summary.total} />
      <SummaryMetric label="Dari tiket" value={summary.dariTiket} />
      <SummaryMetric label="Manual" value={summary.manual} />
    </CompactSummaryGrid>
  )
}
