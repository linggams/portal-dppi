import { prisma } from "@/lib/db/prisma"
import { DANA_STATUS } from "@/lib/dana/constants"
import { IT_TIKET_STATUS } from "@/lib/it/constants"
import { fetchPermintaanGroups } from "@/lib/purchasing/permintaan-groups"
import { fetchPengajuanGroups } from "@/lib/purchasing/pengajuan-groups"
import { getTodayDateWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DASHBOARD_LIST_DAYS,
  DASHBOARD_LIST_LIMIT,
  STOK_KRITIS_THRESHOLD,
  type DashboardDanaStats,
  type DashboardItStats,
  type DashboardMobilStats,
  type DashboardPermintaanItem,
  type DashboardPengajuanItem,
  type DashboardPurchasingStats,
  type DashboardUserStats,
  type PlatformDashboardStats,
} from "./dashboard-types"

function getDateDaysAgoWIB(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(date)
}

function wibDayBounds(dateStr: string): { start: Date; end: Date } {
  return {
    start: new Date(`${dateStr}T00:00:00+07:00`),
    end: new Date(`${dateStr}T23:59:59.999+07:00`),
  }
}

function currentMonthBoundsWIB(): { start: Date; end: Date } {
  const today = getTodayDateWIB()
  const [y, m] = today.split("-")
  const startDate = `${y}-${m}-01`
  const lastDay = new Date(Number(y), Number(m), 0).getDate()
  const endDate = `${y}-${m}-${String(lastDay).padStart(2, "0")}`
  return {
    start: new Date(`${startDate}T00:00:00+07:00`),
    end: new Date(`${endDate}T23:59:59.999+07:00`),
  }
}

function formatDateOnly(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(d)
}

function mapPermintaanItem(
  row: Awaited<ReturnType<typeof fetchPermintaanGroups>>["data"][number]
): DashboardPermintaanItem {
  return {
    unit: row.unit,
    tglPermintaan: row.tglPermintaan,
    jumlahItem: row.jumlahItem,
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
    totalNominal: row.totalNominal,
    hasPending: row.hasPending,
    statusMin: row.statusMin,
    statusMax: row.statusMax,
  }
}

async function fetchUserStats(): Promise<DashboardUserStats> {
  const [total, grouped] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({
      by: ["roleId"],
      _count: { _all: true },
    }),
  ])

  return {
    total,
    roleCount: grouped.filter((row) => row._count._all > 0).length,
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

async function fetchDanaStats(): Promise<DashboardDanaStats> {
  const today = getTodayDateWIB()
  const { start: todayStart, end: todayEnd } = wibDayBounds(today)
  const month = currentMonthBoundsWIB()

  const [pending, approvedToday, rejectedToday, totalBulan, pendingList] =
    await Promise.all([
      prisma.danaPengajuan.count({
        where: { status: DANA_STATUS.PENDING },
      }),
      prisma.danaPengajuan.count({
        where: {
          status: DANA_STATUS.APPROVED,
          tglDisetujui: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.danaPengajuan.count({
        where: {
          status: DANA_STATUS.REJECTED,
          tglDiupdate: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.danaPengajuan.count({
        where: {
          tglDibuat: { gte: month.start, lte: month.end },
        },
      }),
      prisma.danaPengajuan.findMany({
        where: { status: DANA_STATUS.PENDING },
        orderBy: { tglDibuat: "desc" },
        take: DASHBOARD_LIST_LIMIT,
        select: {
          idPengajuan: true,
          nomor: true,
          username: true,
          jabatan: true,
          nominal: true,
          tglDibuat: true,
        },
      }),
    ])

  return {
    pending,
    approvedToday,
    rejectedToday,
    totalBulan,
    pendingList: pendingList.map((row) => ({
      idPengajuan: row.idPengajuan,
      nomor: row.nomor,
      username: row.username,
      jabatan: row.jabatan,
      nominal: row.nominal,
      tglDibuat: row.tglDibuat.toISOString(),
    })),
  }
}

async function fetchMobilStats(): Promise<DashboardMobilStats> {
  const today = getTodayDateWIB()
  const { start: todayStart, end: todayEnd } = wibDayBounds(today)
  const month = currentMonthBoundsWIB()

  const [laporanHariIni, kendaraanAktif, laporanBulan, laporanTerbaru] =
    await Promise.all([
      prisma.mobilLaporanKm.count({
        where: { tanggal: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.mobilKendaraan.count({ where: { aktif: true } }),
      prisma.mobilLaporanKm.findMany({
        where: { tanggal: { gte: month.start, lte: month.end } },
        select: { kmAwal: true, kmAkhir: true },
      }),
      prisma.mobilLaporanKm.findMany({
        orderBy: [{ tanggal: "desc" }, { idLaporan: "desc" }],
        take: DASHBOARD_LIST_LIMIT,
        select: {
          idLaporan: true,
          tanggal: true,
          username: true,
          kmAwal: true,
          kmAkhir: true,
          kendaraan: { select: { nopol: true } },
        },
      }),
    ])

  const kmBulan = laporanBulan.reduce(
    (sum, row) => sum + Math.max(0, row.kmAkhir - row.kmAwal),
    0
  )

  return {
    laporanHariIni,
    kmBulan,
    kendaraanAktif,
    laporanTerbaru: laporanTerbaru.map((row) => ({
      idLaporan: row.idLaporan,
      tanggal: formatDateOnly(row.tanggal),
      username: row.username,
      nopol: row.kendaraan.nopol,
      pemakaian: Math.max(0, row.kmAkhir - row.kmAwal),
    })),
  }
}

export async function fetchPlatformDashboardStats(): Promise<PlatformDashboardStats> {
  const [users, purchasing, it, dana, mobil] = await Promise.all([
    fetchUserStats(),
    fetchPurchasingStats(),
    fetchItStats(),
    fetchDanaStats(),
    fetchMobilStats(),
  ])

  return { users, purchasing, it, dana, mobil }
}
