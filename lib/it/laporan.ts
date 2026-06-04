import { Prisma } from "@prisma/client"
import { IT_TIKET_STATUS } from "@/lib/it/constants"
import { isTiketInQueue } from "@/lib/it/queue"

export type ItLaporanTab = "tiket" | "kategori" | "teknisi"

export interface ItLaporanFilterInput {
  startDate?: string | null
  endDate?: string | null
  status?: string | null
  prioritas?: string | null
  kategoriId?: string | null
  username?: string | null
  ditugaskanKe?: string | null
  dateField?: "dibuat" | "selesai"
}

export interface ItLaporanSummary {
  totalMasuk: number
  dalamAntrian: number
  selesai: number
  ditutup: number
  dibatalkan: number
  rataRataJamSelesai: number | null
}

const tiketInclude = {
  kategori: { select: { idKategori: true, nama: true } },
} as const

export type TiketLaporanRow = Prisma.ItTiketGetPayload<{
  include: typeof tiketInclude
}>

export function buildTiketLaporanWhere(
  filters: ItLaporanFilterInput
): Prisma.ItTiketWhereInput {
  const where: Prisma.ItTiketWhereInput = {}
  const dateField = filters.dateField === "selesai" ? "tglSelesai" : "tglDibuat"

  if (filters.startDate || filters.endDate) {
    const range: Prisma.DateTimeFilter = {}
    if (filters.startDate) {
      range.gte = new Date(`${filters.startDate}T00:00:00`)
    }
    if (filters.endDate) {
      range.lte = new Date(`${filters.endDate}T23:59:59.999`)
    }
    where[dateField] = range
  }

  if (filters.status && filters.status !== "all") {
    where.status = parseInt(filters.status, 10)
  }

  if (filters.prioritas && filters.prioritas !== "all") {
    where.prioritas = filters.prioritas
  }

  if (filters.kategoriId && filters.kategoriId !== "all") {
    where.idKategori = parseInt(filters.kategoriId, 10)
  }

  if (filters.username?.trim()) {
    where.username = { contains: filters.username.trim(), mode: "insensitive" }
  }

  if (filters.ditugaskanKe?.trim()) {
    where.ditugaskanKe = {
      contains: filters.ditugaskanKe.trim(),
      mode: "insensitive",
    }
  }

  return where
}

export function hoursToResolve(
  tglDibuat: Date | string,
  tglSelesai: Date | string | null
): number | null {
  if (!tglSelesai) return null
  const ms =
    new Date(tglSelesai).getTime() - new Date(tglDibuat).getTime()
  if (ms < 0) return null
  return Math.round((ms / (1000 * 60 * 60)) * 10) / 10
}

export function formatJamAtauHari(jam: number | null): string {
  if (jam == null) return "-"
  if (jam < 24) return `${jam} jam`
  const hari = Math.round((jam / 24) * 10) / 10
  return `${hari} hari`
}

export function computeItLaporanSummary(
  tiket: Pick<
    TiketLaporanRow,
    "status" | "tglDibuat" | "tglSelesai"
  >[]
): ItLaporanSummary {
  const resolvedHours = tiket
    .map((t) => hoursToResolve(t.tglDibuat, t.tglSelesai))
    .filter((h): h is number => h != null)

  const rataRataJamSelesai =
    resolvedHours.length > 0
      ? Math.round(
          (resolvedHours.reduce((a, b) => a + b, 0) / resolvedHours.length) * 10
        ) / 10
      : null

  return {
    totalMasuk: tiket.length,
    dalamAntrian: tiket.filter((t) => isTiketInQueue(t.status)).length,
    selesai: tiket.filter((t) => t.status === IT_TIKET_STATUS.SELESAI).length,
    ditutup: tiket.filter((t) => t.status === IT_TIKET_STATUS.DITUTUP).length,
    dibatalkan: tiket.filter((t) => t.status === IT_TIKET_STATUS.DIBATALKAN)
      .length,
    rataRataJamSelesai,
  }
}

export function aggregateByKategori(tiket: TiketLaporanRow[]) {
  const map = new Map<
    string,
    {
      idKategori: number
      kategoriNama: string
      total: number
      dalamAntrian: number
      selesai: number
      jamSelesai: number[]
    }
  >()

  for (const t of tiket) {
    const key = String(t.idKategori)
    const cur = map.get(key) ?? {
      idKategori: t.idKategori,
      kategoriNama: t.kategori.nama,
      total: 0,
      dalamAntrian: 0,
      selesai: 0,
      jamSelesai: [],
    }
    cur.total += 1
    if (isTiketInQueue(t.status)) cur.dalamAntrian += 1
    if (
      t.status === IT_TIKET_STATUS.SELESAI ||
      t.status === IT_TIKET_STATUS.DITUTUP
    ) {
      cur.selesai += 1
    }
    const jam = hoursToResolve(t.tglDibuat, t.tglSelesai)
    if (jam != null) cur.jamSelesai.push(jam)
    map.set(key, cur)
  }

  return [...map.values()]
    .map((row) => ({
      idKategori: row.idKategori,
      kategoriNama: row.kategoriNama,
      total: row.total,
      dalamAntrian: row.dalamAntrian,
      selesai: row.selesai,
      rataRataJamSelesai:
        row.jamSelesai.length > 0
          ? Math.round(
              (row.jamSelesai.reduce((a, b) => a + b, 0) / row.jamSelesai.length) *
                10
            ) / 10
          : null,
    }))
    .sort((a, b) => b.total - a.total)
}

export function aggregateByTeknisi(tiket: TiketLaporanRow[]) {
  const map = new Map<
    string,
    {
      ditugaskanKe: string
      total: number
      dalamAntrian: number
      selesai: number
      jamSelesai: number[]
    }
  >()

  for (const t of tiket) {
    const key = t.ditugaskanKe?.trim() || "Belum ditugaskan"
    const cur = map.get(key) ?? {
      ditugaskanKe: key,
      total: 0,
      dalamAntrian: 0,
      selesai: 0,
      jamSelesai: [],
    }
    cur.total += 1
    if (isTiketInQueue(t.status)) cur.dalamAntrian += 1
    if (
      t.status === IT_TIKET_STATUS.SELESAI ||
      t.status === IT_TIKET_STATUS.DITUTUP
    ) {
      cur.selesai += 1
    }
    const jam = hoursToResolve(t.tglDibuat, t.tglSelesai)
    if (jam != null) cur.jamSelesai.push(jam)
    map.set(key, cur)
  }

  return [...map.values()]
    .map((row) => ({
      ...row,
      rataRataJamSelesai:
        row.jamSelesai.length > 0
          ? Math.round(
              (row.jamSelesai.reduce((a, b) => a + b, 0) / row.jamSelesai.length) *
                10
            ) / 10
          : null,
    }))
    .sort((a, b) => b.total - a.total)
}
