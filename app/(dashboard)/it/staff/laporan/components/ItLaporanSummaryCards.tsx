"use client"

import { CompactSummaryGrid, SummaryMetric } from "@/components/layout"
import { formatJamAtauHari } from "../utils"
import type { ItLaporanSummary } from "../types"

interface Props {
  summary: ItLaporanSummary | null
}

export function ItLaporanSummaryCards({ summary }: Props) {
  if (!summary) return null

  return (
    <CompactSummaryGrid>
      <SummaryMetric label="Total masuk" value={summary.totalMasuk} />
      <SummaryMetric label="Antrian" value={summary.dalamAntrian} />
      <SummaryMetric label="Selesai" value={summary.selesai} />
      <SummaryMetric label="Ditutup" value={summary.ditutup} />
      <SummaryMetric label="Batal" value={summary.dibatalkan} />
      <SummaryMetric
        label="Rata-rata"
        value={formatJamAtauHari(summary.rataRataJamSelesai)}
      />
    </CompactSummaryGrid>
  )
}
