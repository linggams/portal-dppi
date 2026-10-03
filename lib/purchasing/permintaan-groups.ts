import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import {
  PERMINTAAN_GROUP_PAGE_SIZE,
  type PermintaanGroupFilters,
  type PermintaanGroupRow,
  type PermintaanGroupsResult,
} from "./permintaan-group-types"

type RawGroupRow = {
  unit: string
  instansi: string
  tgl_permintaan: Date
  jumlah_item: number
  total_qty: number
  status_min: number
  status_max: number
  has_pending: boolean
}

type RawSummaryRow = {
  total: number
  pending: number
  approved: number
  rejected: number
}

function buildWhereParts(
  filters: PermintaanGroupFilters,
  unitOverride?: string
): Prisma.Sql[] {
  const parts: Prisma.Sql[] = [
    Prisma.sql`p.tgl_permintaan >= ${filters.startDate}::date`,
    Prisma.sql`p.tgl_permintaan <= ${filters.endDate}::date`,
  ]

  if (unitOverride) {
    parts.push(Prisma.sql`u.username = ${unitOverride}`)
  } else if (filters.unit?.trim()) {
    parts.push(Prisma.sql`u.username ILIKE ${`%${filters.unit.trim()}%`}`)
  }

  return parts
}

function buildHavingClause(status: string | null | undefined): Prisma.Sql {
  if (status === "0") {
    return Prisma.sql`HAVING BOOL_OR(p.status = 0)`
  }
  if (status === "1") {
    return Prisma.sql`HAVING NOT BOOL_OR(p.status = 0) AND MIN(p.status) = 1 AND MAX(p.status) = 1`
  }
  if (status === "2") {
    return Prisma.sql`HAVING MIN(p.status) = 2 AND MAX(p.status) = 2`
  }
  return Prisma.empty
}

function mapGroupRow(row: RawGroupRow): PermintaanGroupRow {
  return {
    unit: row.unit,
    instansi: row.instansi,
    tglPermintaan: row.tgl_permintaan.toISOString().split("T")[0],
    jumlahItem: Number(row.jumlah_item),
    totalQty: Number(row.total_qty),
    statusMin: Number(row.status_min),
    statusMax: Number(row.status_max),
    hasPending: Boolean(row.has_pending),
  }
}

export async function fetchPermintaanGroups(
  filters: PermintaanGroupFilters,
  options?: { unitOverride?: string }
): Promise<PermintaanGroupsResult> {
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(
    100,
    Math.max(1, filters.limit ?? PERMINTAAN_GROUP_PAGE_SIZE)
  )
  const offset = (page - 1) * pageSize

  const whereParts = buildWhereParts(filters, options?.unitOverride)
  const whereClause = Prisma.join(whereParts, " AND ")
  const havingClause = buildHavingClause(filters.status)

  const groupsCte = Prisma.sql`
    SELECT
      u.username AS unit,
      u.jabatan AS instansi,
      p.tgl_permintaan,
      COUNT(*)::int AS jumlah_item,
      SUM(p.jumlah)::int AS total_qty,
      MIN(p.status)::int AS status_min,
      MAX(p.status)::int AS status_max,
      BOOL_OR(p.status = 0) AS has_pending
    FROM atk_permintaan p
    JOIN "user" u ON u.id_user = p.id_user
    WHERE ${whereClause}
    GROUP BY u.id_user, u.username, u.jabatan, p.tgl_permintaan
    ${havingClause}
  `

  const [summaryRows, dataRows, countRows] = await Promise.all([
    prisma.$queryRaw<RawSummaryRow[]>`
      WITH grouped AS (${groupsCte})
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE has_pending)::int AS pending,
        COUNT(*) FILTER (
          WHERE NOT has_pending AND status_min = 1 AND status_max = 1
        )::int AS approved,
        COUNT(*) FILTER (
          WHERE NOT has_pending AND status_min = 2 AND status_max = 2
        )::int AS rejected
      FROM grouped
    `,
    prisma.$queryRaw<RawGroupRow[]>`
      WITH grouped AS (${groupsCte})
      SELECT *
      FROM grouped
      ORDER BY tgl_permintaan DESC, unit ASC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<{ total: number }[]>`
      WITH grouped AS (${groupsCte})
      SELECT COUNT(*)::int AS total FROM grouped
    `,
  ])

  const total = Number(countRows[0]?.total ?? 0)
  const summary = summaryRows[0] ?? {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  }

  return {
    data: dataRows.map(mapGroupRow),
    summary: {
      total: Number(summary.total),
      pending: Number(summary.pending),
      approved: Number(summary.approved),
      rejected: Number(summary.rejected),
    },
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
