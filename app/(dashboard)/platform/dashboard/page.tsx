"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  DashboardLayout,
  PageActions,
  StatCard,
} from "@/components/layout"
import { DashboardPendingPermintaanList } from "@/components/dashboard/pending-permintaan-list"
import { DashboardPendingPengajuanList } from "@/components/dashboard/pending-pengajuan-list"
import { DashboardStokKritisList } from "@/components/dashboard/stok-kritis-list"
import { DashboardItmsBaruList } from "@/components/dashboard/itms-baru-list"
import { DashboardMobilLaporanList } from "@/components/dashboard/mobil-laporan-list"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  canHandleMobilWorkflow,
  canHandlePurchasingWorkflow,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import type {
  PlatformDashboardStats,
  PlatformDashboardTab,
} from "@/lib/platform/dashboard-types"

const TAB_ORDER: PlatformDashboardTab[] = ["purchasing", "itms", "mobil"]

function isDashboardTab(value: string | null): value is PlatformDashboardTab {
  return (
    value === "purchasing" || value === "itms" || value === "mobil"
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
    if (canAccessItmsStaff(principal)) tabs.push("itms")
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
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:inline-grid lg:w-auto">
          {availableTabs.includes("purchasing") ? (
            <TabsTrigger value="purchasing">
              Purchasing
              {!loading ? badge(stats?.purchasing.permintaanPendingToday) : ""}
            </TabsTrigger>
          ) : null}
          {availableTabs.includes("itms") ? (
            <TabsTrigger value="itms">
              IT Management
              {!loading ? badge(stats?.itms.open) : ""}
            </TabsTrigger>
          ) : null}
          {availableTabs.includes("mobil") ? (
            <TabsTrigger value="mobil">
              Mobil
              {!loading ? badge(stats?.mobil.laporanHariIni) : ""}
            </TabsTrigger>
          ) : null}
        </TabsList>

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

          <Tabs defaultValue="stok-kritis" className="w-full gap-4">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3 lg:inline-grid lg:w-auto">
              <TabsTrigger value="stok-kritis">
                Stok Kritis
                {!loading ? badge(stats?.purchasing.stokKritisTotal) : ""}
              </TabsTrigger>
              <TabsTrigger value="permintaan">
                Permintaan Pending
                {!loading
                  ? badge(stats?.purchasing.permintaanPendingToday)
                  : ""}
              </TabsTrigger>
              <TabsTrigger value="pengajuan">
                Pengajuan Pending
                {!loading
                  ? badge(stats?.purchasing.pengajuanPendingToday)
                  : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stok-kritis">
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <DashboardStokKritisList
                  items={stats?.purchasing.stokKritis ?? []}
                  total={stats?.purchasing.stokKritisTotal}
                />
              )}
            </TabsContent>
            <TabsContent value="permintaan">
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <DashboardPendingPermintaanList
                  items={stats?.purchasing.pendingPermintaan ?? []}
                />
              )}
            </TabsContent>
            <TabsContent value="pengajuan">
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <DashboardPendingPengajuanList
                  items={stats?.purchasing.pendingPengajuan ?? []}
                />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="itms" className="space-y-6">
          {loading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="New"
                value={stats?.itms.newTickets.length ?? 0}
              />
              <StatCard label="Open" value={stats?.itms.open ?? 0} />
              <StatCard label="Unassigned" value={stats?.itms.unassigned ?? 0} />
              <StatCard label="Total" value={stats?.itms.total ?? 0} />
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-medium">New IT tickets</h2>
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardItmsBaruList items={stats?.itms.newTickets ?? []} />
            )}
          </section>
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

          <section className="space-y-3">
            <h2 className="text-sm font-medium">Laporan KM Terbaru</h2>
            {loading ? (
              <Skeleton className="h-48" />
            ) : (
              <DashboardMobilLaporanList
                items={stats?.mobil.laporanTerbaru ?? []}
              />
            )}
          </section>
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
