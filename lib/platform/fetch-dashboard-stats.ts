import { prisma } from "@/lib/db/prisma"
import { IT_TIKET_STATUS } from "@/lib/it/constants"
import { fetchPermintaanGroups } from "@/lib/purchasing/permintaan-groups"
import { fetchPengajuanGroups } from "@/lib/purchasing/pengajuan-groups"
import { getTodayDateWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DASHBOARD_LIST_DAYS,
  DASHBOARD_LIST_LIMIT,
  STOK_KRITIS_THRESHOLD,
  type DashboardItStats,
  type DashboardPermintaanItem,
  type DashboardPengajuanItem,
  type DashboardPurchasingStats,
  type DashboardUserStats,
  type PlatformDashboardStats,
  type PurchasingDashboardStats,
} from "./dashboard-types"

function getDateDaysAgoWIB(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(date)
}

function mapPermintaanItem(
  row: Awaited<ReturnType<typeof fetchPermintaanGroups>>["data"][number]
): DashboardPermintaanItem {
  return {
    unit: row.unit,
    instansi: row.instansi,
    tglPermintaan: row.tglPermintaan,
    jumlahItem: row.jumlahItem,
    totalQty: row.totalQty,
    hasPending: row.hasPending,
    statusMin: row.statusMin,
    statusMax: row.statusMax,
  }
}

function mapPengajuanItem(
  row: Awaited<ReturnType<typeof fetchPengajuanGroups>>["data"][number]
): DashboardPengajuanItem {
  return {
    unit: row.unit,
    tglPengajuan: row.tglPengajuan,
    jumlahItem: row.jumlahItem,
    totalNominal: row.totalNominal,
    hasPending: row.hasPending,
    statusMin: row.statusMin,
    statusMax: row.statusMax,
  }
}

async function fetchUserStats(): Promise<DashboardUserStats> {
  const grouped = await prisma.user.groupBy({
    by: ["level"],
    _count: { _all: true },
  })

  const byLevel = {
    user: 0,
    administrator: 0,
    it_support: 0,
    purchasing: 0,
  }

  for (const row of grouped) {
    if (row.level in byLevel) {
      byLevel[row.level as keyof typeof byLevel] = row._count._all
    }
  }

  return {
    total: Object.values(byLevel).reduce((sum, count) => sum + count, 0),
    byLevel,
  }
}

async function fetchPurchasingStats(): Promise<DashboardPurchasingStats> {
  const today = getTodayDateWIB()
  const listStart = getDateDaysAgoWIB(DASHBOARD_LIST_DAYS)

  const [
    permintaanToday,
    pengajuanToday,
    permintaanPending,
    pengajuanPending,
    stokKritis,
    stokKritisTotal,
  ] = await Promise.all([
    fetchPermintaanGroups({
      startDate: today,
      endDate: today,
      status: "0",
      limit: 1,
    }),
    fetchPengajuanGroups({
      startDate: today,
      endDate: today,
      status: "0",
      limit: 1,
    }),
    fetchPermintaanGroups({
      startDate: listStart,
      endDate: today,
      status: "0",
      limit: DASHBOARD_LIST_LIMIT,
    }),
    fetchPengajuanGroups({
      startDate: listStart,
      endDate: today,
      status: "0",
      limit: DASHBOARD_LIST_LIMIT,
    }),
    prisma.stokbarang.findMany({
      where: { sisa: { lte: STOK_KRITIS_THRESHOLD } },
      orderBy: { sisa: "asc" },
      take: DASHBOARD_LIST_LIMIT,
      select: {
        kodeBrg: true,
        namaBrg: true,
        sisa: true,
        satuan: true,
      },
    }),
    prisma.stokbarang.count({
      where: { sisa: { lte: STOK_KRITIS_THRESHOLD } },
    }),
  ])

  return {
    permintaanPendingToday: permintaanToday.summary.pending,
    pengajuanPendingToday: pengajuanToday.summary.pending,
    pendingPermintaan: permintaanPending.data.map(mapPermintaanItem),
    pendingPengajuan: pengajuanPending.data.map(mapPengajuanItem),
    stokKritis,
    stokKritisTotal,
  }
}

async function fetchItStats(): Promise<DashboardItStats> {
  const [total, baru, aktif, selesai, tiketBaru] = await Promise.all([
    prisma.itTiket.count(),
    prisma.itTiket.count({ where: { status: IT_TIKET_STATUS.BARU } }),
    prisma.itTiket.count({
      where: {
        status: {
          in: [
            IT_TIKET_STATUS.DITUGASKAN,
            IT_TIKET_STATUS.SEDANG_DIKERJAKAN,
            IT_TIKET_STATUS.MENUNGGU_USER,
          ],
        },
      },
    }),
    prisma.itTiket.count({
      where: {
        status: {
          in: [IT_TIKET_STATUS.SELESAI, IT_TIKET_STATUS.DITUTUP],
        },
      },
    }),
    prisma.itTiket.findMany({
      where: { status: IT_TIKET_STATUS.BARU },
      orderBy: { tglDibuat: "desc" },
      take: DASHBOARD_LIST_LIMIT,
      select: {
        idTiket: true,
        nomorTiket: true,
        judul: true,
        status: true,
      },
    }),
  ])

  return {
    total,
    baru,
    aktif,
    selesai,
    tiketBaru,
  }
}

export async function fetchPlatformDashboardStats(): Promise<PlatformDashboardStats> {
  const [users, purchasing, it] = await Promise.all([
    fetchUserStats(),
    fetchPurchasingStats(),
    fetchItStats(),
  ])

  return { users, purchasing, it }
}

export async function fetchPurchasingDashboardStats(): Promise<PurchasingDashboardStats> {
  const today = getTodayDateWIB()
  const listStart = getDateDaysAgoWIB(DASHBOARD_LIST_DAYS)

  const [permintaanToday, pengajuanToday, permintaanPending, pengajuanPending] =
    await Promise.all([
      fetchPermintaanGroups({
        startDate: today,
        endDate: today,
        status: "0",
        limit: 1,
      }),
      fetchPengajuanGroups({
        startDate: today,
        endDate: today,
        status: "0",
        limit: 1,
      }),
      fetchPermintaanGroups({
        startDate: listStart,
        endDate: today,
        status: "0",
        limit: DASHBOARD_LIST_LIMIT,
      }),
      fetchPengajuanGroups({
        startDate: listStart,
        endDate: today,
        status: "0",
        limit: DASHBOARD_LIST_LIMIT,
      }),
    ])

  return {
    permintaanPendingToday: permintaanToday.summary.pending,
    pengajuanPendingToday: pengajuanToday.summary.pending,
    pendingPermintaan: permintaanPending.data.map(mapPermintaanItem),
    pendingPengajuan: pengajuanPending.data.map(mapPengajuanItem),
  }
}
