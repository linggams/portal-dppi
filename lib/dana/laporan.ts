import type { Prisma } from "@prisma/client"
import { DANA_STATUS, danaTerpakai } from "./constants"

export type DanaLaporanTab = "daftar" | "jabatan"

export type DanaLaporanFilters = {
  startDate: string | null
  endDate: string | null
  status: string
  q: string | null
  jabatan: string | null
}

export type DanaLaporanSummary = {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
  nominalDisetujui: number
  kembalian: number
  danaTerpakai: number
}

export type DanaLaporanRow = {
  idPengajuan: number
  nomor: string
  username: string
  jabatan: string
  nominal: number
  kembalian: number
  terpakai: number
  keperluan: string
  status: number
  tglDibuat: string
  tglDisetujui: string | null
}

export type DanaLaporanByJabatan = {
  jabatan: string
  total: number
  approved: number
  rejected: number
  pending: number
  nominalDisetujui: number
  danaTerpakai: number
}

type DanaSourceRow = {
  idPengajuan: number
  nomor: string
  username: string
  jabatan: string
  nominal: number
  kembalian: number | null
  keperluan: string
  status: number
  tglDibuat: Date
  tglDisetujui: Date | null
}

function endOfDay(dateStr: string) {
  const d = new Date(dateStr)
  d.setHours(23, 59, 59, 999)
  return d
}

export function buildDanaLaporanWhere(
  filters: DanaLaporanFilters
): Prisma.DanaPengajuanWhereInput {
  const where: Prisma.DanaPengajuanWhereInput = {}

  if (filters.startDate || filters.endDate) {
    where.tglDibuat = {}
    if (filters.startDate) {
      where.tglDibuat.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      where.tglDibuat.lte = endOfDay(filters.endDate)
    }
  }

  if (filters.status !== "all" && filters.status !== "") {
    const parsed = parseInt(filters.status, 10)
    if (!Number.isNaN(parsed)) where.status = parsed
  }

  const q = filters.q?.trim()
  if (q) {
    where.OR = [
      { nomor: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { keperluan: { contains: q, mode: "insensitive" } },
    ]
  }

  const jabatan = filters.jabatan?.trim()
  if (jabatan) {
    where.jabatan = { contains: jabatan, mode: "insensitive" }
  }

  return where
}

export function toDanaLaporanRow(row: DanaSourceRow): DanaLaporanRow {
  const kembalian = row.kembalian ?? 0
  return {
    idPengajuan: row.idPengajuan,
    nomor: row.nomor,
    username: row.username,
    jabatan: row.jabatan,
    nominal: row.nominal,
    kembalian,
    terpakai: danaTerpakai(row.nominal, kembalian),
    keperluan: row.keperluan,
    status: row.status,
    tglDibuat: row.tglDibuat.toISOString(),
    tglDisetujui: row.tglDisetujui?.toISOString() ?? null,
  }
}

export function computeDanaLaporanSummary(
  rows: DanaSourceRow[]
): DanaLaporanSummary {
  let pending = 0
  let approved = 0
  let rejected = 0
  let cancelled = 0
  let nominalDisetujui = 0
  let kembalian = 0
  let terpakai = 0

  for (const row of rows) {
    const k = row.kembalian ?? 0
    switch (row.status) {
      case DANA_STATUS.PENDING:
        pending += 1
        break
      case DANA_STATUS.APPROVED:
        approved += 1
        nominalDisetujui += row.nominal
        kembalian += k
        terpakai += danaTerpakai(row.nominal, k)
        break
      case DANA_STATUS.REJECTED:
        rejected += 1
        break
      case DANA_STATUS.CANCELLED:
        cancelled += 1
        break
    }
  }

  return {
    total: rows.length,
    pending,
    approved,
    rejected,
    cancelled,
    nominalDisetujui,
    kembalian,
    danaTerpakai: terpakai,
  }
}

export function aggregateDanaByJabatan(
  rows: DanaSourceRow[]
): DanaLaporanByJabatan[] {
  const map = new Map<string, DanaLaporanByJabatan>()

  for (const row of rows) {
    const key = row.jabatan || "-"
    const current = map.get(key) ?? {
      jabatan: key,
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      nominalDisetujui: 0,
      danaTerpakai: 0,
    }

    current.total += 1
    if (row.status === DANA_STATUS.PENDING) current.pending += 1
    if (row.status === DANA_STATUS.REJECTED) current.rejected += 1
    if (row.status === DANA_STATUS.APPROVED) {
      current.approved += 1
      current.nominalDisetujui += row.nominal
      current.danaTerpakai += danaTerpakai(row.nominal, row.kembalian ?? 0)
    }

    map.set(key, current)
  }

  return Array.from(map.values()).sort((a, b) =>
    a.jabatan.localeCompare(b.jabatan, "id")
  )
}
