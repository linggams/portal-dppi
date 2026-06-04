import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import { IT_TIKET_STATUS } from "@/lib/it/constants"
import { hoursToResolve } from "@/lib/it/laporan"
import type { MaintenanceFilterInput, MaintenanceRow } from "@/lib/it/maintenance-shared"

function parseDateRange(filters: MaintenanceFilterInput) {
  const range: { gte?: Date; lte?: Date } = {}
  if (filters.startDate) {
    range.gte = new Date(`${filters.startDate}T00:00:00`)
  }
  if (filters.endDate) {
    range.lte = new Date(`${filters.endDate}T23:59:59.999`)
  }
  return Object.keys(range).length > 0 ? range : undefined
}

function minutesBetween(start: Date | string, end: Date | string | null): number | null {
  if (!end) return null
  const hours = hoursToResolve(start, end)
  if (hours == null) return null
  return Math.round(hours * 60)
}

export async function fetchCompletedTiketRows(
  filters: MaintenanceFilterInput
): Promise<MaintenanceRow[]> {
  const dateRange = parseDateRange(filters)
  const kategoriId =
    filters.kategoriId && filters.kategoriId !== "all"
      ? parseInt(filters.kategoriId, 10)
      : undefined

  const where: Prisma.ItTiketWhereInput = {
    status: { in: [IT_TIKET_STATUS.SELESAI, IT_TIKET_STATUS.DITUTUP] },
    ...(dateRange ? { tglSelesai: dateRange } : {}),
    ...(kategoriId ? { idKategori: kategoriId } : {}),
    ...(filters.username?.trim()
      ? { ditugaskanKe: { contains: filters.username.trim(), mode: "insensitive" } }
      : {}),
  }

  const tiket = await prisma.itTiket.findMany({
    where,
    include: { kategori: { select: { idKategori: true, nama: true } } },
    orderBy: { tglSelesai: "desc" },
  })

  return tiket.map((t) => {
    const tglKerja = t.tglSelesai ?? t.tglDiupdate
    return {
      id: `tiket-${t.idTiket}`,
      sumber: "tiket" as const,
      idTiket: t.idTiket,
      idMaintenance: null,
      nomorTiket: t.nomorTiket,
      tglKerja: tglKerja.toISOString(),
      username: t.ditugaskanKe?.trim() || "—",
      idKategori: t.idKategori,
      kategoriNama: t.kategori.nama,
      judul: t.judul,
      lokasi: t.jabatan,
      jenisPekerjaan: null,
      durasiMenit: minutesBetween(t.tglDibuat, t.tglSelesai),
      hasil: "selesai",
    }
  })
}

export async function fetchManualMaintenanceRows(
  filters: MaintenanceFilterInput
): Promise<MaintenanceRow[]> {
  const dateRange = parseDateRange(filters)
  const kategoriId =
    filters.kategoriId && filters.kategoriId !== "all"
      ? parseInt(filters.kategoriId, 10)
      : undefined

  const where: Prisma.ItMaintenanceLogWhereInput = {
    ...(dateRange ? { tglKerja: dateRange } : {}),
    ...(kategoriId ? { idKategori: kategoriId } : {}),
    ...(filters.username?.trim()
      ? { username: { contains: filters.username.trim(), mode: "insensitive" } }
      : {}),
    ...(filters.hasil && filters.hasil !== "all" ? { hasil: filters.hasil } : {}),
  }

  const logs = await prisma.itMaintenanceLog.findMany({
    where,
    include: {
      kategori: { select: { idKategori: true, nama: true } },
      tiket: { select: { nomorTiket: true } },
    },
    orderBy: { tglKerja: "desc" },
  })

  return logs.map((l) => ({
    id: `log-${l.idMaintenance}`,
    sumber: "manual" as const,
    idTiket: l.idTiket,
    idMaintenance: l.idMaintenance,
    nomorTiket: l.tiket?.nomorTiket ?? null,
    tglKerja: l.tglKerja.toISOString(),
    username: l.username,
    idKategori: l.idKategori,
    kategoriNama: l.kategori.nama,
    judul: l.judul,
    lokasi: l.lokasi,
    jenisPekerjaan: l.jenisPekerjaan,
    durasiMenit: l.durasiMenit,
    hasil: l.hasil,
  }))
}
