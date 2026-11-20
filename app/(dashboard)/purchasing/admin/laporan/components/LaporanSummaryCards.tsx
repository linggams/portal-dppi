"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import { formatRupiah } from "../utils"
import type { LaporanSummary } from "../types"

interface LaporanSummaryCardsProps {
  summary: LaporanSummary
}

export function LaporanSummaryCards({ summary }: LaporanSummaryCardsProps) {
  if (Object.keys(summary).length === 0) return null

  const items: { label: string; value: string | number }[] = []
  if (summary.totalItems !== undefined) {
    items.push({ label: "Total item", value: summary.totalItems })
  }
  if (summary.totalJumlah !== undefined) {
    items.push({ label: "Total qty", value: summary.totalJumlah })
  }
  if (summary.totalHarga !== undefined) {
    items.push({ label: "Total Rp", value: formatRupiah(summary.totalHarga) })
  }
  if (summary.pending !== undefined) {
    items.push({ label: "Pending", value: summary.pending })
  }
  if (summary.approved !== undefined) {
    items.push({ label: "Approved", value: summary.approved })
  }
  if (summary.totalStok !== undefined) {
    items.push({ label: "Total stock", value: summary.totalStok })
  }
  if (summary.totalKeluar !== undefined) {
    items.push({ label: "Total out", value: summary.totalKeluar })
  }
  if (summary.totalSisa !== undefined) {
    items.push({ label: "Total remaining", value: summary.totalSisa })
  }
  if (summary.lowStock !== undefined) {
    items.push({ label: "Low stock", value: summary.lowStock })
  }

  return (
    <CompactSummaryGrid>
      {items.map((item) => (
        <SummaryMetric key={item.label} label={item.label} value={item.value} />
      ))}
    </CompactSummaryGrid>
  )
}
