/** Client-safe: types, labels, and pure helpers (no Prisma/pg). */

export type MaintenanceSumber = "tiket" | "manual"

export const MAINTENANCE_SUMBER_LABEL: Record<MaintenanceSumber, string> = {
  tiket: "Dari Tiket",
  manual: "Catatan Manual",
}

export function getMaintenanceRowClassName(sumber: MaintenanceSumber): string {
  return sumber === "tiket"
    ? "border-l-2 border-l-blue-500 bg-blue-500/[0.06] hover:bg-blue-500/10"
    : "border-l-2 border-l-amber-500 bg-amber-500/[0.06] hover:bg-amber-500/10"
}
export type MaintenanceTab = "daftar" | "kategori" | "teknisi"

export const IT_JENIS_PEKERJAAN = [
  "preventif",
  "korektif",
  "rutin",
  "insiden",
] as const

export const IT_JENIS_PEKERJAAN_LABEL: Record<string, string> = {
  preventif: "Preventif",
  korektif: "Korektif",
  rutin: "Rutin",
  insiden: "Insiden",
}

export const IT_HASIL_PEKERJAAN = ["selesai", "tindak_lanjut"] as const

export const IT_HASIL_PEKERJAAN_LABEL: Record<string, string> = {
  selesai: "Selesai",
  tindak_lanjut: "Perlu tindak lanjut",
}

export interface MaintenanceFilterInput {
  startDate?: string | null
  endDate?: string | null
  kategoriId?: string | null
  username?: string | null
  sumber?: string | null
  hasil?: string | null
  q?: string | null
}

export interface MaintenanceRow {
  id: string
  sumber: MaintenanceSumber
  idTiket: number | null
  idMaintenance: number | null
  nomorTiket: string | null
  tglKerja: string
  username: string
  idKategori: number
  kategoriNama: string
  judul: string
  lokasi: string | null
  jenisPekerjaan: string | null
  durasiMenit: number | null
  hasil: string
}

export interface MaintenanceSummary {
  total: number
  dariTiket: number
  manual: number
  perKategori: { idKategori: number; nama: string; total: number }[]
}

export interface KategoriMaintenanceAgg {
  idKategori: number
  kategoriNama: string
  total: number
  dariTiket: number
  manual: number
  rataRataMenit: number | null
}

export interface TeknisiMaintenanceAgg {
  username: string
  total: number
  dariTiket: number
  manual: number
  rataRataMenit: number | null
}

function matchesQuery(row: MaintenanceRow, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    row.judul.toLowerCase().includes(needle) ||
    (row.nomorTiket?.toLowerCase().includes(needle) ?? false) ||
    (row.lokasi?.toLowerCase().includes(needle) ?? false) ||
    row.kategoriNama.toLowerCase().includes(needle) ||
    row.username.toLowerCase().includes(needle)
  )
}

export function mergeMaintenanceRows(
  filters: MaintenanceFilterInput,
  tiketRows: MaintenanceRow[],
  manualRows: MaintenanceRow[]
): MaintenanceRow[] {
  const sumber = filters.sumber ?? "all"
  let rows: MaintenanceRow[] = []
  if (sumber === "all" || sumber === "tiket") rows = rows.concat(tiketRows)
  if (sumber === "all" || sumber === "manual") rows = rows.concat(manualRows)

  if (filters.hasil && filters.hasil !== "all") {
    rows = rows.filter((r) => r.hasil === filters.hasil)
  }

  if (filters.q?.trim()) {
    rows = rows.filter((r) => matchesQuery(r, filters.q!))
  }

  return rows.sort(
    (a, b) => new Date(b.tglKerja).getTime() - new Date(a.tglKerja).getTime()
  )
}

export function computeMaintenanceSummary(rows: MaintenanceRow[]): MaintenanceSummary {
  const map = new Map<number, { idKategori: number; nama: string; total: number }>()

  for (const r of rows) {
    const cur = map.get(r.idKategori) ?? {
      idKategori: r.idKategori,
      nama: r.kategoriNama,
      total: 0,
    }
    cur.total += 1
    map.set(r.idKategori, cur)
  }

  return {
    total: rows.length,
    dariTiket: rows.filter((r) => r.sumber === "tiket").length,
    manual: rows.filter((r) => r.sumber === "manual").length,
    perKategori: [...map.values()].sort((a, b) => b.total - a.total),
  }
}

export function aggregateMaintenanceByKategori(
  rows: MaintenanceRow[]
): KategoriMaintenanceAgg[] {
  const map = new Map<number, KategoriMaintenanceAgg & { menit: number[] }>()

  for (const r of rows) {
    const cur = map.get(r.idKategori) ?? {
      idKategori: r.idKategori,
      kategoriNama: r.kategoriNama,
      total: 0,
      dariTiket: 0,
      manual: 0,
      rataRataMenit: null,
      menit: [],
    }
    cur.total += 1
    if (r.sumber === "tiket") cur.dariTiket += 1
    else cur.manual += 1
    if (r.durasiMenit != null) cur.menit.push(r.durasiMenit)
    map.set(r.idKategori, cur)
  }

  return [...map.values()]
    .map(({ menit, ...row }) => ({
      ...row,
      rataRataMenit:
        menit.length > 0
          ? Math.round(menit.reduce((a, b) => a + b, 0) / menit.length)
          : null,
    }))
    .sort((a, b) => b.total - a.total)
}

export function aggregateMaintenanceByTeknisi(
  rows: MaintenanceRow[]
): TeknisiMaintenanceAgg[] {
  const map = new Map<string, TeknisiMaintenanceAgg & { menit: number[] }>()

  for (const r of rows) {
    const key = r.username.trim() || "—"
    const cur = map.get(key) ?? {
      username: key,
      total: 0,
      dariTiket: 0,
      manual: 0,
      rataRataMenit: null,
      menit: [],
    }
    cur.total += 1
    if (r.sumber === "tiket") cur.dariTiket += 1
    else cur.manual += 1
    if (r.durasiMenit != null) cur.menit.push(r.durasiMenit)
    map.set(key, cur)
  }

  return [...map.values()]
    .map(({ menit, ...row }) => ({
      ...row,
      rataRataMenit:
        menit.length > 0
          ? Math.round(menit.reduce((a, b) => a + b, 0) / menit.length)
          : null,
    }))
    .sort((a, b) => b.total - a.total)
}

export function formatDurasiMenit(menit: number | null): string {
  if (menit == null) return "—"
  if (menit < 60) return `${menit} m`
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  return sisa > 0 ? `${jam} j ${sisa} m` : `${jam} j`
}
