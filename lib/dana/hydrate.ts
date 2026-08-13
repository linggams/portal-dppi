import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"
import type { DanaRow } from "./map"

type HydrateableRow = Omit<DanaRow, "kembalian"> & {
  kembalian?: number | null
}

export async function attachKembalian<T extends HydrateableRow>(
  rows: T[]
): Promise<(T & { kembalian: number })[]> {
  if (rows.length === 0) return []

  const needsHydrate = rows.some((row) => typeof row.kembalian !== "number")
  if (!needsHydrate) {
    return rows.map((row) => ({ ...row, kembalian: row.kembalian ?? 0 }))
  }

  const extra = await prisma.$queryRaw<{ id_pengajuan: number; kembalian: number }[]>(
    Prisma.sql`SELECT id_pengajuan, kembalian FROM dana_pengajuan WHERE id_pengajuan IN (${Prisma.join(
      rows.map((row) => row.idPengajuan)
    )})`
  )
  const map = new Map(
    extra.map((row) => [Number(row.id_pengajuan), Number(row.kembalian)])
  )

  return rows.map((row) => ({
    ...row,
    kembalian: row.kembalian ?? map.get(row.idPengajuan) ?? 0,
  }))
}

export async function updateKembalianRaw(idPengajuan: number, kembalian: number) {
  await prisma.$executeRaw`
    UPDATE dana_pengajuan
    SET kembalian = ${kembalian}, tgl_diupdate = CURRENT_TIMESTAMP
    WHERE id_pengajuan = ${idPengajuan}
  `
}
