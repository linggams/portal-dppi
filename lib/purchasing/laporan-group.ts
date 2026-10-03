export type LaporanGroup = {
  kategori: string
  rows: Record<string, unknown>[]
  jumlah: number
  total: number
  stok: number
  keluar: number
  sisa: number
}

function num(item: Record<string, unknown>, key: string) {
  const value = item[key]
  return typeof value === "number" ? value : Number(value) || 0
}

export function kategoriLabel(
  item: Record<string, unknown>,
  tab: string
): string {
  if (tab === "stok") {
    const jenis = item.jenisBarang as { jenisBrg?: string } | undefined
    return jenis?.jenisBrg?.trim() || "Tanpa kategori"
  }
  const stok = item.stokbarang as
    | { jenisBarang?: { jenisBrg?: string } }
    | undefined
  return stok?.jenisBarang?.jenisBrg?.trim() || "Tanpa kategori"
}

export function sortByKategoriThen<T>(
  rows: T[],
  tab: string,
  compareWithin: (a: T, b: T) => number
) {
  rows.sort((a, b) => {
    const byKategori = kategoriLabel(
      a as Record<string, unknown>,
      tab
    ).localeCompare(kategoriLabel(b as Record<string, unknown>, tab), "id")
    if (byKategori !== 0) return byKategori
    return compareWithin(a, b)
  })
  return rows
}

export function groupLaporan(
  rows: Record<string, unknown>[],
  tab: string
): LaporanGroup[] {
  const order: string[] = []
  const buckets = new Map<string, Record<string, unknown>[]>()

  for (const row of rows) {
    const kategori = kategoriLabel(row, tab)
    const bucket = buckets.get(kategori)
    if (bucket) {
      bucket.push(row)
    } else {
      order.push(kategori)
      buckets.set(kategori, [row])
    }
  }

  return order.map((kategori) => {
    const groupRows = buckets.get(kategori) ?? []
    return {
      kategori,
      rows: groupRows,
      jumlah: groupRows.reduce((sum, row) => sum + num(row, "jumlah"), 0),
      total: groupRows.reduce((sum, row) => sum + num(row, "total"), 0),
      stok: groupRows.reduce((sum, row) => sum + num(row, "stok"), 0),
      keluar: groupRows.reduce((sum, row) => sum + num(row, "keluar"), 0),
      sisa: groupRows.reduce((sum, row) => sum + num(row, "sisa"), 0),
    }
  })
}

export function groupMeta(group: LaporanGroup, tab: string) {
  if (tab === "stok") return `${group.rows.length} item`
  return `${group.rows.length} item · jml ${group.jumlah}`
}
