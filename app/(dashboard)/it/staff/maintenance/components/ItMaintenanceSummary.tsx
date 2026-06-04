"use client"

import { CompactSummaryGrid, StatCard } from "@/components/layout"
import type { MaintenanceSummaryData } from "../types"

interface Props {
  summary: MaintenanceSummaryData | null
}

export function ItMaintenanceSummary({ summary }: Props) {
  if (!summary) return null

  return (
    <CompactSummaryGrid maxCols={4}>
      <StatCard compact label="Total" value={summary.total} />
      <StatCard
        compact
        label="Dari tiket"
        value={summary.dariTiket}
        className="border-l-4 border-l-blue-500"
      />
      <StatCard
        compact
        label="Manual"
        value={summary.manual}
        className="border-l-4 border-l-amber-500"
      />
    </CompactSummaryGrid>
  )
}
