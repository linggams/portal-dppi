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
  PLATFORM_QUICK_LINKS,
} from "@/components/dashboard/quick-links"
import { DashboardStokKritisList } from "@/components/dashboard/stok-kritis-list"
import { DashboardTiketBaruList } from "@/components/dashboard/tiket-baru-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { PlatformDashboardStats } from "@/lib/platform/dashboard-types"

export default function PlatformDashboardPage() {
  const [stats, setStats] = useState<PlatformDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/platform/dashboard/stats")
      .then((r) => r.json())
      .then((data: PlatformDashboardStats) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Dashboard">
      <PageActions>
        <Button asChild variant="outline" size="sm">
          <Link href="/platform/users">Kelola User</Link>
        </Button>
      </PageActions>

      <div className="space-y-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total User"
              value={
                <span>
                  {stats?.users.total ?? 0}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {stats
                      ? `${Object.values(stats.users.byLevel).filter((n) => n > 0).length} role aktif`
                      : "-"}
                  </span>
                </span>
              }
            />
            <StatCard
              label="Permintaan Pending"
              value={
                <span>
                  {stats?.purchasing.permintaanPendingToday ?? 0}
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
                  {stats?.purchasing.pengajuanPendingToday ?? 0}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    hari ini
                  </span>
                </span>
              }
            />
            <StatCard
              label="Tiket IT Baru"
              value={
                <span>
                  {stats?.it.baru ?? 0}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {stats ? `${stats.it.aktif} sedang diproses` : "-"}
                  </span>
                </span>
              }
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Permintaan Pending">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardPendingPermintaanList
                items={stats?.purchasing.pendingPermintaan ?? []}
              />
            )}
          </SectionCard>

          <SectionCard title="Pengajuan Pending">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardPendingPengajuanList
                items={stats?.purchasing.pendingPengajuan ?? []}
              />
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Stok Kritis">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardStokKritisList
                items={stats?.purchasing.stokKritis ?? []}
                total={stats?.purchasing.stokKritisTotal}
              />
            )}
          </SectionCard>

          <SectionCard title="Tiket IT Baru">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardTiketBaruList items={stats?.it.tiketBaru ?? []} />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Akses Cepat">
          <DashboardQuickLinks groups={[...PLATFORM_QUICK_LINKS]} />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}
