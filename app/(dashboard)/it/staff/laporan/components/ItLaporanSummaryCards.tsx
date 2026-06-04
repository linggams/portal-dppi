"use client"

import { CompactSummaryGrid, StatCard } from "@/components/layout"
import { formatJamAtauHari } from "../utils"
import type { ItLaporanSummary } from "../types"

interface Props {
  summary: ItLaporanSummary | null
}

export function ItLaporanSummaryCards({ summary }: Props) {
  if (!summary) return null

  return (
    <CompactSummaryGrid maxCols={4}>
      <StatCard compact label="Total masuk" value={summary.totalMasuk} />
      <StatCard compact label="Antrian" value={summary.dalamAntrian} />
      <StatCard compact label="Selesai" value={summary.selesai} />
      <StatCard compact label="Ditutup" value={summary.ditutup} />
      <StatCard compact label="Batal" value={summary.dibatalkan} />
      <StatCard
        compact
        label="Rata-rata"
        value={formatJamAtauHari(summary.rataRataJamSelesai)}
      />
    </CompactSummaryGrid>
  )
}
