"use client"

import {
  CompactSummaryGrid,
} from "@/components/layout"
import type { PermintaanGroupsSummary } from "../types"

interface Props {
  summary: PermintaanGroupsSummary
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function PermintaanGroupSummary({ summary }: Props) {
  return (
    <CompactSummaryGrid>
      <SummaryItem label="Total batch" value={summary.total} />
      <SummaryItem label="Pending" value={summary.pending} />
      <SummaryItem label="Disetujui" value={summary.approved} />
      <SummaryItem label="Ditolak" value={summary.rejected} />
    </CompactSummaryGrid>
  )
}
