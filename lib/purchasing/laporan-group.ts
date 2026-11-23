import {
  toPaginatedResult,
  type PaginatedResult,
} from "@/lib/shared/pagination"

export type LaporanLeafGroup = {
  key: string
  label: string
  rows: Record<string, unknown>[]
  jumlah: number
  total: number
  stok: number
  keluar: number
  sisa: number
  users: string[]
}

/** Section = tanggal (UI transaksi), kategori (PDF/stok). */
export type LaporanSection = {
  key: string
  title: string
  groups: LaporanLeafGroup[]
  jumlah: number
  total: number
  stok: number
  keluar: number
  sisa: number
  itemCount: number
  users: string[]
}

function num(item: Record<string, unknown>, key: string) {
  const value = item[key]
  return typeof value === "number" ? value : Number(value) || 0
}

function toDateKey(value: unknown): string {
  if (!value) return ""
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return s
}

/** YYYY-MM dari tanggal */
export function toMonthKey(value: unknown): string {
  const day = toDateKey(value)
  if (/^\d{4}-\d{2}/.test(day)) return day.slice(0, 7)
  return ""
}

export function tanggalField(tab: string): string | null {
  switch (tab) {
    case "permintaan":
      return "tglPermintaan"
    case "pengajuan":
      return "tglPengajuan"
    case "pemasukan":
      return "tglMasuk"
    case "pengeluaran":
      return "tglKeluar"
    default:
      return null
  }
}

export function isTransaksiTab(tab: string) {
  return tanggalField(tab) !== null
}

export function kategoriLabel(
  item: Record<string, unknown>,
  tab: string
): string {
  if (typeof item.kategori === "string" && item.kategori.trim()) {
    return item.kategori.trim()
  }
  if (tab === "stok") {
    const jenis = item.jenisBarang as { jenisBrg?: string } | undefined
    return jenis?.jenisBrg?.trim() || "Tanpa kategori"
  }
  const stok = item.stokbarang as
    | { jenisBarang?: { jenisBrg?: string } }
    | undefined
  return stok?.jenisBarang?.jenisBrg?.trim() || "Tanpa kategori"
}

/** Username tunggal (bukan string hasil merge multi-user). */
export function singleUnitLabel(item: Record<string, unknown>): string {
  const merged = item.mergedUsers
  if (Array.isArray(merged) && merged.length === 1) {
    const only = merged[0]
    if (typeof only === "string" && only.trim()) return only.trim()
  }
  const pemohon = item.pemohon as { username?: string } | undefined
  if (typeof pemohon?.username === "string" && pemohon.username.trim()) {
    return pemohon.username.trim()
  }
  const rawUnit =
    typeof item.unit === "string" && item.unit.trim()
      ? item.unit.trim()
      : typeof item.unitKey === "string" && item.unitKey.trim()
        ? item.unitKey.trim()
        : ""
  if (rawUnit && !rawUnit.includes(", ")) return rawUnit
  return "Tanpa unit"
}

/** Label kolom User — setelah merge: "via (5), vera (3)". */
export function unitLabel(item: Record<string, unknown>): string {
  if (typeof item.unitKey === "string" && item.unitKey.trim()) {
    return item.unitKey.trim()
  }
  if (typeof item.unit === "string" && item.unit.trim()) return item.unit.trim()
  return singleUnitLabel(item)
}

export function namaBarangLabel(item: Record<string, unknown>): string {
  return String(
    (item.stokbarang as { namaBrg?: string } | undefined)?.namaBrg ??
      item.namaBrg ??
      ""
  ).trim()
}

function satuanLabel(item: Record<string, unknown>, tab: string): string {
  if (tab === "pengajuan") return String(item.satuan ?? "").trim()
  return String(
    (item.stokbarang as { satuan?: string } | undefined)?.satuan ??
      item.satuan ??
      ""
  ).trim()
}

export function rowTanggalKey(
  item: Record<string, unknown>,
  tab: string
): string {
  if (typeof item.tanggalKey === "string" && item.tanggalKey) {
    return item.tanggalKey
  }
  const field = tanggalField(tab)
  if (!field) return ""
  return toDateKey(item[field]) || "Tanpa tanggal"
}

function uniqueUsers(rows: Record<string, unknown>[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    const merged = row.mergedUsers
    if (Array.isArray(merged)) {
      for (const u of merged) {
        if (typeof u === "string" && u.trim()) set.add(u.trim())
      }
      continue
    }
    const qty = row.userQty
    if (qty && typeof qty === "object" && !Array.isArray(qty)) {
      for (const u of Object.keys(qty as Record<string, number>)) {
        if (u.trim()) set.add(u.trim())
      }
      continue
    }
    const u = singleUnitLabel(row)
    if (u) set.add(u)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "id"))
}

/** Format: "via (5), vera (3)" */
export function formatUserQtyLabel(
  userQty: Record<string, number> | Map<string, number>
): string {
  const entries =
    userQty instanceof Map
      ? Array.from(userQty.entries())
      : Object.entries(userQty)
  return entries
    .sort((a, b) => a[0].localeCompare(b[0], "id"))
    .map(([user, qty]) => `${user} (${qty})`)
    .join(", ")
}

function collectUserQty(
  rows: Record<string, unknown>[]
): Record<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const existing = row.userQty
    if (existing && typeof existing === "object" && !Array.isArray(existing)) {
      for (const [u, q] of Object.entries(
        existing as Record<string, number>
      )) {
        if (!u.trim()) continue
        map.set(u.trim(), (map.get(u.trim()) ?? 0) + Number(q || 0))
      }
      continue
    }
    const u = singleUnitLabel(row)
    map.set(u, (map.get(u) ?? 0) + num(row, "jumlah"))
  }
  return Object.fromEntries(map)
}

/**
 * Kunci merge dalam satu section (tanggal / kategori):
 * - permintaan/pengajuan: nama + satuan + status
 * - pengeluaran: nama + satuan + user (span table)
 * - lainnya: nama + satuan
 */
function mergeRowKey(item: Record<string, unknown>, tab: string): string {
  const nama = namaBarangLabel(item).toLowerCase()
  const satuan = satuanLabel(item, tab).toLowerCase()
  if (tab === "permintaan" || tab === "pengajuan") {
    return `${nama}|${satuan}|${Number(item.status ?? 0)}`
  }
  if (tab === "pengeluaran") {
    return `${nama}|${satuan}|${singleUnitLabel(item).toLowerCase()}`
  }
  return `${nama}|${satuan}`
}

/** Gabung nama barang sama; User → "via (5), vera (3)" (kecuali pengeluaran). */
export function mergeSameNamaRows(
  rows: Record<string, unknown>[],
  tab: string
): Record<string, unknown>[] {
  if (!isTransaksiTab(tab) || rows.length === 0) return rows

  const order: string[] = []
  const buckets = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const key = mergeRowKey(row, tab)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(row)
    else {
      order.push(key)
      buckets.set(key, [row])
    }
  }

  return order.map((key) => {
    const group = buckets.get(key) ?? []
    const first = { ...group[0]! }
    first.jumlah = group.reduce((sum, row) => sum + num(row, "jumlah"), 0)
    first.total = group.reduce((sum, row) => sum + num(row, "total"), 0)

    if (tab === "pengeluaran") {
      const user = singleUnitLabel(group[0]!)
      first.mergedUsers = [user]
      first.userQty = { [user]: first.jumlah as number }
      first.unitKey = user
      first.unit = user
      return first
    }

    const userQty = collectUserQty(group)
    const users = Object.keys(userQty).sort((a, b) => a.localeCompare(b, "id"))
    first.userQty = userQty
    first.mergedUsers = users
    first.unitKey = formatUserQtyLabel(userQty)
    first.unit = first.unitKey
    return first
  })
}

/** Lengkapi key grouping di root baris. */
export function attachLaporanKeys<T extends Record<string, unknown>>(
  rows: T[],
  tab: string
): (T & {
  kategori: string
  tanggalKey: string
  bulanKey: string
  unitKey: string
})[] {
  return rows.map((row) => {
    const tanggalKey = isTransaksiTab(tab) ? rowTanggalKey(row, tab) : ""
    return {
      ...row,
      kategori: kategoriLabel(row, tab),
      tanggalKey,
      bulanKey: isTransaksiTab(tab)
        ? toMonthKey(tanggalKey) || "Tanpa bulan"
        : "",
      unitKey: isTransaksiTab(tab) ? singleUnitLabel(row) : "",
    }
  })
}

function leafTotals(rows: Record<string, unknown>[]): Omit<
  LaporanLeafGroup,
  "key" | "label" | "rows" | "users"
> {
  return {
    jumlah: rows.reduce((sum, row) => sum + num(row, "jumlah"), 0),
    total: rows.reduce((sum, row) => sum + num(row, "total"), 0),
    stok: rows.reduce((sum, row) => sum + num(row, "stok"), 0),
    keluar: rows.reduce((sum, row) => sum + num(row, "keluar"), 0),
    sisa: rows.reduce((sum, row) => sum + num(row, "sisa"), 0),
  }
}

function makeLeaf(
  key: string,
  label: string,
  rows: Record<string, unknown>[]
): LaporanLeafGroup {
  return {
    key,
    label,
    rows,
    users: uniqueUsers(rows),
    ...leafTotals(rows),
  }
}

function sectionFromLeaf(
  key: string,
  title: string,
  leaf: LaporanLeafGroup
): LaporanSection {
  return {
    key,
    title,
    groups: [leaf],
    jumlah: leaf.jumlah,
    total: leaf.total,
    stok: leaf.stok,
    keluar: leaf.keluar,
    sisa: leaf.sisa,
    itemCount: leaf.rows.length,
    users: leaf.users,
  }
}

/**
 * Sort transaksi: tanggal desc → nama → user.
 * Stok: kategori asc → nama.
 */
export function sortLaporanRows<T>(
  rows: T[],
  tab: string,
  compareWithin: (a: T, b: T) => number
) {
  rows.sort((a, b) => {
    const ra = a as Record<string, unknown>
    const rb = b as Record<string, unknown>
    if (isTransaksiTab(tab)) {
      const byDate = rowTanggalKey(rb, tab).localeCompare(
        rowTanggalKey(ra, tab),
        "id"
      )
      if (byDate !== 0) return byDate
      const byNama = namaBarangLabel(ra).localeCompare(
        namaBarangLabel(rb),
        "id"
      )
      if (byNama !== 0) return byNama
      const byUser = singleUnitLabel(ra).localeCompare(
        singleUnitLabel(rb),
        "id"
      )
      if (byUser !== 0) return byUser
      return compareWithin(a, b)
    }
    const byKat = kategoriLabel(ra, tab).localeCompare(
      kategoriLabel(rb, tab),
      "id"
    )
    if (byKat !== 0) return byKat
    return compareWithin(a, b)
  })
  return rows
}

/** Daftar kategori unik (urut) dari baris. */
export function listKategoriOptions(
  rows: Record<string, unknown>[],
  tab: string
): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    set.add(kategoriLabel(row, tab))
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "id"))
}

/**
 * UI transaksi: section = tanggal, satu leaf (nama digabung).
 * Stok: section = kategori.
 */
export function buildLaporanSections(
  rows: Record<string, unknown>[],
  tab: string
): LaporanSection[] {
  if (rows.length === 0) return []

  if (!isTransaksiTab(tab)) {
    const order: string[] = []
    const buckets = new Map<string, Record<string, unknown>[]>()
    for (const row of rows) {
      const key = kategoriLabel(row, tab)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(row)
      else {
        order.push(key)
        buckets.set(key, [row])
      }
    }
    return order.map((key) => {
      const groupRows = buckets.get(key) ?? []
      return sectionFromLeaf(key, key, makeLeaf(key, key, groupRows))
    })
  }

  const dateOrder: string[] = []
  const byDate = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const d = rowTanggalKey(row, tab)
    const bucket = byDate.get(d)
    if (bucket) bucket.push(row)
    else {
      dateOrder.push(d)
      byDate.set(d, [row])
    }
  }

  return dateOrder.map((dateKey) => {
    const raw = byDate.get(dateKey) ?? []
    const merged = mergeSameNamaRows(raw, tab)
    return sectionFromLeaf(dateKey, dateKey, makeLeaf(dateKey, dateKey, merged))
  })
}

/**
 * Export PDF: section = kategori (full-width, bertumpuk).
 * Opsional filter daftar kategori terpilih.
 */
export function buildLaporanSectionsByKategori(
  rows: Record<string, unknown>[],
  tab: string,
  selectedKategori?: string[] | null
): LaporanSection[] {
  if (rows.length === 0) return []

  const allow =
    selectedKategori && selectedKategori.length > 0
      ? new Set(selectedKategori)
      : null

  const order: string[] = []
  const buckets = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const key = kategoriLabel(row, tab)
    if (allow && !allow.has(key)) continue
    const bucket = buckets.get(key)
    if (bucket) bucket.push(row)
    else {
      order.push(key)
      buckets.set(key, [row])
    }
  }

  return order.map((key) => {
    const raw = buckets.get(key) ?? []
    const merged = isTransaksiTab(tab) ? mergeSameNamaRows(raw, tab) : raw
    return sectionFromLeaf(key, key, makeLeaf(key, key, merged))
  })
}

export function leafMeta(group: LaporanLeafGroup, tab: string) {
  if (tab === "stok") return `${group.rows.length} item`
  const userPart =
    group.users.length > 0 ? ` · ${group.users.length} user` : ""
  return `${group.rows.length} item · jml ${group.jumlah}${userPart}`
}

/** Pagination tanpa memotong section tanggal/kategori. */
export function paginateByCompleteGroups(
  rows: Record<string, unknown>[],
  tab: string,
  page: number,
  pageSize: number
): PaginatedResult<Record<string, unknown>> {
  const sections = buildLaporanSections(rows, tab)
  const leaves = sections.flatMap((s) => s.groups)
  const allMerged = leaves.flatMap((leaf) => leaf.rows)
  const pages: Record<string, unknown>[][] = []
  let current: Record<string, unknown>[] = []
  let currentCount = 0

  for (const leaf of leaves) {
    const n = leaf.rows.length
    if (currentCount > 0 && currentCount + n > pageSize) {
      pages.push(current)
      current = []
      currentCount = 0
    }
    current.push(...leaf.rows)
    currentCount += n
    if (currentCount >= pageSize) {
      pages.push(current)
      current = []
      currentCount = 0
    }
  }
  if (current.length > 0) pages.push(current)

  const totalPages = Math.max(1, pages.length)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const pageRows = pages[safePage - 1] ?? []

  return toPaginatedResult(pageRows, allMerged.length, safePage, pageSize)
}

/** Baris dalam tabel kategori Pengeluaran (User span). */
export type PengeluaranTableRow =
  | {
      type: "item"
      key: string
      user: string
      showUser: boolean
      userRowSpan: number
      namaBarang: string
      qty: number
      total: number
    }
  | {
      type: "user-subtotal" | "category-subtotal"
      key: string
      label: string
      qty: number
      total: number
    }

export type PengeluaranCategoryBlock = {
  key: string
  label: string
  itemCount: number
  users: string[]
  qty: number
  rows: PengeluaranTableRow[]
}

export type PengeluaranDaySection = {
  tanggalKey: string
  tanggalLabel: string
  itemCount: number
  users: string[]
  qty: number
  categories: PengeluaranCategoryBlock[]
}

type PengeluaranItem = {
  tanggalKey: string
  kategori: string
  user: string
  namaBarang: string
  qty: number
}

function preparePengeluaranItems(
  rows: Record<string, unknown>[]
): PengeluaranItem[] {
  const merged = mergeSameNamaRows(rows, "pengeluaran")
  const items: PengeluaranItem[] = merged.map((row) => ({
    tanggalKey: rowTanggalKey(row, "pengeluaran"),
    kategori: kategoriLabel(row, "pengeluaran"),
    user: singleUnitLabel(row),
    namaBarang: namaBarangLabel(row) || "Tanpa nama",
    qty: num(row, "jumlah"),
  }))

  items.sort((a, b) => {
    const byDate = b.tanggalKey.localeCompare(a.tanggalKey, "id")
    if (byDate !== 0) return byDate
    const byKat = a.kategori.localeCompare(b.kategori, "id")
    if (byKat !== 0) return byKat
    const byUser = a.user.localeCompare(b.user, "id")
    if (byUser !== 0) return byUser
    return a.namaBarang.localeCompare(b.namaBarang, "id")
  })
  return items
}

function buildCategoryBlock(
  tanggalKey: string,
  kategori: string,
  catItems: PengeluaranItem[]
): PengeluaranCategoryBlock {
  const userOrder: string[] = []
  const byUser = new Map<string, PengeluaranItem[]>()
  for (const item of catItems) {
    const bucket = byUser.get(item.user)
    if (bucket) bucket.push(item)
    else {
      userOrder.push(item.user)
      byUser.set(item.user, [item])
    }
  }

  const rows: PengeluaranTableRow[] = []
  let catQty = 0
  let itemCount = 0

  for (const user of userOrder) {
    const userItems = byUser.get(user) ?? []
    const userRowSpan = userItems.length
    let userQty = 0
    let userShown = false

    for (const [index, item] of userItems.entries()) {
      userQty += item.qty
      itemCount += 1
      rows.push({
        type: "item",
        key: `${tanggalKey}|${kategori}|${user}|${item.namaBarang}|${index}`,
        user,
        showUser: !userShown,
        userRowSpan,
        namaBarang: item.namaBarang,
        qty: item.qty,
        total: item.qty,
      })
      userShown = true
    }

    rows.push({
      type: "user-subtotal",
      key: `${tanggalKey}|${kategori}|${user}|sub`,
      label: `Subtotal ${user}`,
      qty: userQty,
      total: userQty,
    })
    catQty += userQty
  }

  rows.push({
    type: "category-subtotal",
    key: `${tanggalKey}|${kategori}|cat-sub`,
    label: `Subtotal ${kategori}`,
    qty: catQty,
    total: catQty,
  })

  return {
    key: `${tanggalKey}|${kategori}`,
    label: kategori,
    itemCount,
    users: userOrder,
    qty: catQty,
    rows,
  }
}

/**
 * Pengeluaran: Hari → Kategori → User (span) → Item.
 * Total = qty (agregat jumlah).
 */
export function buildPengeluaranDaySections(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
): { days: PengeluaranDaySection[]; grandQty: number } {
  const items = preparePengeluaranItems(rows)
  if (items.length === 0) return { days: [], grandQty: 0 }

  const dateOrder: string[] = []
  const byDate = new Map<string, PengeluaranItem[]>()
  for (const item of items) {
    const bucket = byDate.get(item.tanggalKey)
    if (bucket) bucket.push(item)
    else {
      dateOrder.push(item.tanggalKey)
      byDate.set(item.tanggalKey, [item])
    }
  }

  const days: PengeluaranDaySection[] = []
  let grandQty = 0

  for (const tanggalKey of dateOrder) {
    const dateItems = byDate.get(tanggalKey) ?? []
    const katOrder: string[] = []
    const byKat = new Map<string, PengeluaranItem[]>()
    for (const item of dateItems) {
      const bucket = byKat.get(item.kategori)
      if (bucket) bucket.push(item)
      else {
        katOrder.push(item.kategori)
        byKat.set(item.kategori, [item])
      }
    }

    const categories = katOrder.map((kat) =>
      buildCategoryBlock(tanggalKey, kat, byKat.get(kat) ?? [])
    )
    const dateQty = categories.reduce((sum, c) => sum + c.qty, 0)
    const itemCount = categories.reduce((sum, c) => sum + c.itemCount, 0)
    const users = Array.from(
      new Set(categories.flatMap((c) => c.users))
    ).sort((a, b) => a.localeCompare(b, "id"))

    days.push({
      tanggalKey,
      tanggalLabel: formatTanggal(tanggalKey),
      itemCount,
      users,
      qty: dateQty,
      categories,
    })
    grandQty += dateQty
  }

  return { days, grandQty }
}

/** @deprecated gunakan buildPengeluaranDaySections */
export function buildPengeluaranTableRows(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
) {
  const { days, grandQty } = buildPengeluaranDaySections(rows, formatTanggal)
  const flat: PengeluaranTableRow[] = days.flatMap((d) =>
    d.categories.flatMap((c) => c.rows)
  )
  return { rows: flat, grandQty }
}

/**
 * PDF content blocks untuk Pengeluaran: hari → kategori (full-width).
 * Setiap kategori = satu tabel User/Item/Qty/Total.
 */
export function buildPengeluaranPdfContent(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { blocks: any[]; grandQty: number } {
  const { days, grandQty } = buildPengeluaranDaySections(rows, formatTanggal)
  const widths = [70, "*", 42, 42]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = []

  const header = [
    { text: "User", style: "tableHeader", alignment: "center" },
    { text: "Item name", style: "tableHeader", alignment: "center" },
    { text: "Qty", style: "tableHeader", alignment: "center" },
    { text: "Total", style: "tableHeader", alignment: "center" },
  ]

  days.forEach((day, dayIndex) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dayStack: any[] = [
      {
        text: `${day.tanggalLabel}   ·   ${day.itemCount} item · ${day.users.length} user · jml ${day.qty}`,
        style: "sectionTitle",
        margin: [0, 0, 0, 8],
      },
    ]

    day.categories.forEach((cat, catIndex) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[][] = [header]

      for (const row of cat.rows) {
        if (row.type === "item") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const line: any[] = []
          if (row.showUser) {
            line.push({
              text: row.user,
              style: "tableCell",
              rowSpan: row.userRowSpan,
              valign: "middle",
            })
          } else {
            line.push({})
          }
          line.push({ text: row.namaBarang, style: "tableCell" })
          line.push({
            text: String(row.qty),
            style: "tableCell",
            alignment: "right",
          })
          line.push({
            text: String(row.total),
            style: "tableCell",
            alignment: "right",
          })
          body.push(line)
          continue
        }

        if (row.type === "user-subtotal") {
          body.push([
            {
              text: row.label,
              style: "subtotal",
              colSpan: 2,
              alignment: "left",
            },
            {},
            { text: String(row.qty), style: "subtotal", alignment: "right" },
            { text: String(row.total), style: "subtotal", alignment: "right" },
          ])
          continue
        }

        // category-subtotal
        body.push([
          {
            text: row.label,
            style: "sectionTotal",
            colSpan: 2,
            alignment: "left",
          },
          {},
          {
            text: String(row.qty),
            style: "sectionTotal",
            alignment: "right",
          },
          {
            text: String(row.total),
            style: "sectionTotal",
            alignment: "right",
          },
        ])
      }

      dayStack.push({
        text: `Kategori: ${cat.label}   ·   ${cat.itemCount} item · jml ${cat.qty}`,
        style: "unitTitle",
        margin: [0, catIndex === 0 ? 0 : 10, 0, 4],
      })
      dayStack.push({
        table: { widths, headerRows: 1, body },
        layout: {
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7,
          hLineColor: () => "#9ca3af",
          vLineColor: () => "#9ca3af",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return "#f3f4f6"
            return null
          },
        },
        margin: [0, 0, 0, 4],
      })
    })

    dayStack.push({
      table: {
        widths,
        body: [
          [
            {
              text: `Subtotal ${day.tanggalLabel}`,
              style: "sectionTotal",
              colSpan: 2,
            },
            {},
            {
              text: String(day.qty),
              style: "sectionTotal",
              alignment: "right",
            },
            {
              text: String(day.qty),
              style: "sectionTotal",
              alignment: "right",
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.7,
        vLineWidth: () => 0.7,
        hLineColor: () => "#9ca3af",
        vLineColor: () => "#9ca3af",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
        fillColor: () => "#f3f4f6",
      },
      margin: [0, 6, 0, 0],
    })

    blocks.push({
      stack: dayStack,
      pageBreak: dayIndex > 0 ? "before" : undefined,
    })
  })

  blocks.push({
    table: {
      widths,
      body: [
        [
          {
            text: "Total keseluruhan",
            style: "grandTotal",
            colSpan: 2,
          },
          {},
          {
            text: String(grandQty),
            style: "grandTotal",
            alignment: "right",
          },
          {
            text: String(grandQty),
            style: "grandTotal",
            alignment: "right",
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.7,
      vLineWidth: () => 0.7,
      hLineColor: () => "#9ca3af",
      vLineColor: () => "#9ca3af",
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 4,
      paddingBottom: () => 4,
      fillColor: () => "#e5e7eb",
    },
    margin: [0, 12, 0, 0],
  })

  return { blocks, grandQty }
}

/** @deprecated gunakan buildPengeluaranPdfContent */
export function buildPengeluaranPdfTableBody(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
) {
  const { blocks, grandQty } = buildPengeluaranPdfContent(rows, formatTanggal)
  return { body: blocks, grandQty }
}
