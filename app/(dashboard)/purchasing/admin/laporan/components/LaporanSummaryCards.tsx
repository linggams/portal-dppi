"use client"

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import type { LaporanSummary } from "../types"

interface LaporanSummaryCardsProps {
  summary: LaporanSummary
}

export function LaporanSummaryCards({ summary }: LaporanSummaryCardsProps) {
  if (Object.keys(summary).length === 0) return null

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {summary.totalItems !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItems}</div>
          </CardContent>
        </Card>
      )}
      {summary.totalJumlah !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jumlah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalJumlah}</div>
          </CardContent>
        </Card>
      )}
      {summary.pending !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending}</div>
          </CardContent>
        </Card>
      )}
      {summary.approved !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disetujui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.approved}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
