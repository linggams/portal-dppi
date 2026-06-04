"use client"

import { StatCard } from "@/components/layout/stat-card"
import { formatJamAtauHari } from "../utils"
import type { ItLaporanSummary } from "../types"

interface Props {
  summary: ItLaporanSummary | null
}

export function ItLaporanSummaryCards({ summary }: Props) {
  if (!summary) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Total masuk" value={summary.totalMasuk} />
      <StatCard label="Dalam antrian" value={summary.dalamAntrian} />
      <StatCard label="Selesai" value={summary.selesai} />
      <StatCard label="Ditutup" value={summary.ditutup} />
      <StatCard label="Dibatalkan" value={summary.dibatalkan} />
      <StatCard
        label="Rata-rata selesai"
        value={formatJamAtauHari(summary.rataRataJamSelesai)}
      />
    </div>
  )
}
