"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import type { LaporanSummary } from "../types"

interface LaporanSummaryCardsProps {
  summary: LaporanSummary
}

export function LaporanSummaryCards({ summary }: LaporanSummaryCardsProps) {
  if (Object.keys(summary).length === 0) return null

  const items: { label: string; value: number }[] = []
  if (summary.totalItems !== undefined) {
    items.push({ label: "Total item", value: summary.totalItems })
  }
  if (summary.totalJumlah !== undefined) {
    items.push({ label: "Total jumlah", value: summary.totalJumlah })
  }
  if (summary.pending !== undefined) {
    items.push({ label: "Pending", value: summary.pending })
  }
  if (summary.approved !== undefined) {
    items.push({ label: "Disetujui", value: summary.approved })
  }

  return (
    <CompactSummaryGrid>
      {items.map((item) => (
        <SummaryMetric key={item.label} label={item.label} value={item.value} />
      ))}
    </CompactSummaryGrid>
  )
}
