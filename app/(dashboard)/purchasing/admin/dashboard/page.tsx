"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  DashboardLayout,
  PageActions,
  SectionCard,
  StatCard,
} from "@/components/layout"
import { DashboardPendingPermintaanList } from "@/components/dashboard/pending-permintaan-list"
import { DashboardPendingPengajuanList } from "@/components/dashboard/pending-pengajuan-list"
import {
  DashboardQuickLinks,
  PURCHASING_STAFF_QUICK_LINKS,
} from "@/components/dashboard/quick-links"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { PurchasingDashboardStats } from "@/lib/platform/dashboard-types"

export default function PurchasingAdminDashboardPage() {
  const [stats, setStats] = useState<PurchasingDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/purchasing/admin/dashboard/stats")
      .then((r) => r.json())
      .then((data: PurchasingDashboardStats) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const totalPendingToday =
    (stats?.permintaanPendingToday ?? 0) + (stats?.pengajuanPendingToday ?? 0)

  return (
    <DashboardLayout title="Dashboard Purchasing">
      <PageActions>
        <Button asChild size="sm">
          <Link href="/purchasing/admin/permintaan/data?status=0">
            Data Permintaan
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/purchasing/admin/pengajuan/data?status=0">
            Data Pengajuan
          </Link>
        </Button>
      </PageActions>

      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Permintaan Pending"
              value={
                <span>
                  {stats?.permintaanPendingToday ?? 0}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    hari ini
                  </span>
                </span>
              }
            />
            <StatCard
              label="Pengajuan Pending"
              value={
                <span>
                  {stats?.pengajuanPendingToday ?? 0}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    hari ini
                  </span>
                </span>
              }
            />
            <StatCard
              label="Total Antrian Hari Ini"
              value={
                <span>
                  {totalPendingToday}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    permintaan + pengajuan
                  </span>
                </span>
              }
            />
          </div>
        )}

        <SectionCard title="Antrian Permintaan">
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <DashboardPendingPermintaanList
              items={stats?.pendingPermintaan ?? []}
            />
          )}
        </SectionCard>

        <SectionCard title="Antrian Pengajuan">
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <DashboardPendingPengajuanList
              items={stats?.pendingPengajuan ?? []}
            />
          )}
        </SectionCard>

        <SectionCard title="Akses Cepat">
          <DashboardQuickLinks groups={[...PURCHASING_STAFF_QUICK_LINKS]} />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
