"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
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
  DANA_QUICK_LINKS,
  IT_QUICK_LINKS,
  MOBIL_QUICK_LINKS,
  PURCHASING_QUICK_LINKS,
} from "@/components/dashboard/quick-links"
import { DashboardStokKritisList } from "@/components/dashboard/stok-kritis-list"
import { DashboardTiketBaruList } from "@/components/dashboard/tiket-baru-list"
import { DashboardDanaPendingList } from "@/components/dashboard/dana-pending-list"
import { DashboardMobilLaporanList } from "@/components/dashboard/mobil-laporan-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  canHandleDanaWorkflow,
  canHandleMobilWorkflow,
  canHandlePurchasingWorkflow,
  canAccessItStaff,
} from "@/lib/auth/permissions"
import type {
  PlatformDashboardStats,
  PlatformDashboardTab,
} from "@/lib/platform/dashboard-types"

const TAB_ORDER: PlatformDashboardTab[] = [
  "purchasing",
  "it",
  "dana",
  "mobil",
]

function isDashboardTab(value: string | null): value is PlatformDashboardTab {
  return (
    value === "purchasing" ||
    value === "it" ||
    value === "dana" ||
    value === "mobil"
  )
}

export default function PlatformDashboardPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Dashboard">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </DashboardLayout>
      }
    >
      <PlatformDashboardContent />
    </Suspense>
  )
}

function PlatformDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const principal = session?.user

  const [stats, setStats] = useState<PlatformDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const availableTabs = useMemo(() => {
    if (!principal) return TAB_ORDER
    const tabs: PlatformDashboardTab[] = []
    if (canHandlePurchasingWorkflow(principal)) tabs.push("purchasing")
    if (canAccessItStaff(principal)) tabs.push("it")
    if (canHandleDanaWorkflow(principal)) tabs.push("dana")
    if (canHandleMobilWorkflow(principal)) tabs.push("mobil")
    return tabs.length > 0 ? tabs : TAB_ORDER
  }, [principal])

  const tabFromUrl = searchParams.get("tab")
  const activeTab: PlatformDashboardTab = useMemo(() => {
    if (isDashboardTab(tabFromUrl) && availableTabs.includes(tabFromUrl)) {
      return tabFromUrl
    }
    return availableTabs[0] ?? "purchasing"
  }, [tabFromUrl, availableTabs])

  useEffect(() => {
    fetch("/api/platform/dashboard/stats")
      .then((r) => r.json())
      .then((data: PlatformDashboardStats) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const setTab = (value: string) => {
    if (!isDashboardTab(value)) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.replace(`/platform/dashboard?${params.toString()}`, {
      scroll: false,
    })
  }

  const badge = (count: number | undefined) =>
    typeof count === "number" && count > 0 ? ` (${count})` : ""

  const quickLinks =
    activeTab === "purchasing"
      ? PURCHASING_QUICK_LINKS
      : activeTab === "it"
        ? IT_QUICK_LINKS
        : activeTab === "dana"
          ? DANA_QUICK_LINKS
          : MOBIL_QUICK_LINKS

  return (
    <DashboardLayout title="Dashboard">
      <PageActions>
        <div className="mr-auto hidden text-sm text-muted-foreground sm:block">
          {stats ? (
            <>
              {stats.users.total} user · {stats.users.roleCount} role
            </>
          ) : null}
        </div>
        <Button asChild variant="outline">
          <Link href="/platform/users">Kelola User</Link>
        </Button>
      </PageActions>

      <Tabs value={activeTab} onValueChange={setTab} className="w-full space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4 lg:inline-grid lg:w-auto">
          {availableTabs.includes("purchasing") ? (
            <TabsTrigger value="purchasing">
              Purchasing
              {!loading ? badge(stats?.purchasing.permintaanPendingToday) : ""}
            </TabsTrigger>
          ) : null}
          {availableTabs.includes("it") ? (
            <TabsTrigger value="it">
              IT Support
              {!loading ? badge(stats?.it.baru) : ""}
            </TabsTrigger>
          ) : null}
          {availableTabs.includes("dana") ? (
            <TabsTrigger value="dana">
              Dana
              {!loading ? badge(stats?.dana.pending) : ""}
            </TabsTrigger>
          ) : null}
          {availableTabs.includes("mobil") ? (
            <TabsTrigger value="mobil">
              Mobil
              {!loading ? badge(stats?.mobil.laporanHariIni) : ""}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <SectionCard title="Akses Cepat">
          <DashboardQuickLinks groups={[...quickLinks]} />
        </SectionCard>

        <TabsContent value="purchasing" className="space-y-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                label="Stok Kritis"
                value={stats?.purchasing.stokKritisTotal ?? 0}
              />
              <StatCard
                label="Total User"
                value={
                  <span>
                    {stats?.users.total ?? 0}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {stats ? `${stats.users.roleCount} role aktif` : "-"}
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
        </TabsContent>

        <TabsContent value="it" className="space-y-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Tiket Baru" value={stats?.it.baru ?? 0} />
              <StatCard label="Sedang Diproses" value={stats?.it.aktif ?? 0} />
              <StatCard label="Selesai" value={stats?.it.selesai ?? 0} />
              <StatCard label="Total Tiket" value={stats?.it.total ?? 0} />
            </div>
          )}

          <SectionCard title="Tiket IT Baru">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardTiketBaruList items={stats?.it.tiketBaru ?? []} />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="dana" className="space-y-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Pending" value={stats?.dana.pending ?? 0} />
              <StatCard
                label="Disetujui Hari Ini"
                value={stats?.dana.approvedToday ?? 0}
              />
              <StatCard
                label="Ditolak Hari Ini"
                value={stats?.dana.rejectedToday ?? 0}
              />
              <StatCard
                label="Total Bulan Ini"
                value={stats?.dana.totalBulan ?? 0}
              />
            </div>
          )}

          <SectionCard title="Antrian Pengajuan Dana">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardDanaPendingList items={stats?.dana.pendingList ?? []} />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="mobil" className="space-y-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Laporan Hari Ini"
                value={stats?.mobil.laporanHariIni ?? 0}
              />
              <StatCard
                label="KM Bulan Ini"
                value={(stats?.mobil.kmBulan ?? 0).toLocaleString("id-ID")}
              />
              <StatCard
                label="Kendaraan Aktif"
                value={stats?.mobil.kendaraanAktif ?? 0}
              />
              <StatCard
                label="Total User"
                value={stats?.users.total ?? 0}
              />
            </div>
          )}

          <SectionCard title="Laporan KM Terbaru">
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardMobilLaporanList
                items={stats?.mobil.laporanTerbaru ?? []}
              />
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  )
}
