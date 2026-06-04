"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout, PageActions, StatCard, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IT_TIKET_STATUS } from "@/lib/it/constants"

export default function ItDashboardPage() {  const [stats, setStats] = useState({
    total: 0,
    baru: 0,
    aktif: 0,
    selesai: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/it/tiket")
      .then((r) => r.json())
      .then((data: { status: number }[]) => {
        if (!Array.isArray(data)) return
        setStats({
          total: data.length,
          baru: data.filter((t) => t.status === IT_TIKET_STATUS.BARU).length,
          aktif: data.filter(
            (t) =>
              t.status >= IT_TIKET_STATUS.DITUGASKAN &&
              t.status <= IT_TIKET_STATUS.MENUNGGU_USER
          ).length,
          selesai: data.filter(
            (t) =>
              t.status === IT_TIKET_STATUS.SELESAI ||
              t.status === IT_TIKET_STATUS.DITUTUP
          ).length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Dashboard IT Support">
      <PageActions>
        <Button asChild>
          <Link href="/it/staff/tiket">Antrian Tiket</Link>
        </Button>
      </PageActions>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Tiket" value={stats.total} />
          <StatCard label="Baru" value={stats.baru} />
          <StatCard label="Sedang Diproses" value={stats.aktif} />
          <StatCard label="Selesai / Ditutup" value={stats.selesai} />
        </div>
      )}

      <SectionCard title="Akses Cepat">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/it/staff/tiket">Kelola Antrian</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/it/staff/kategori">Kelola Kategori</Link>
          </Button>
        </div>
      </SectionCard>
    </DashboardLayout>
  )
}
