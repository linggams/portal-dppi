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

/** Baris dalam tabel kategori Pengeluaran. */
export type PengeluaranTableRow =
  | {
      type: "date-header"
      key: string
      label: string
    }
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
      type: "user-subtotal" | "date-subtotal" | "category-subtotal"
      key: string
      label: string
      qty: number
      total: number
    }

/** Blok per kategori: di dalamnya tanggal sebagai row. */
export type PengeluaranCategorySection = {
  key: string
  label: string
  itemCount: number
  users: string[]
  qty: number
  rows: PengeluaranTableRow[]
}

type PengeluaranItem = {
  tanggalKey: string
  kategori: string
  user: string
  namaBarang: string
  qty: number
}

/**
 * Merge nama hanya dalam tanggal yang sama (tidak lintas hari).
 * Urutan: kategori → tanggal desc → user → nama.
 */
function preparePengeluaranItems(
  rows: Record<string, unknown>[]
): PengeluaranItem[] {
  const dateOrder: string[] = []
  const byDate = new Map<string, Record<string, unknown>[]>()
  for (const row of rows) {
    const d = rowTanggalKey(row, "pengeluaran")
    const bucket = byDate.get(d)
    if (bucket) bucket.push(row)
    else {
      dateOrder.push(d)
      byDate.set(d, [row])
    }
  }

  const items: PengeluaranItem[] = []
  for (const tanggalKey of dateOrder) {
    const merged = mergeSameNamaRows(byDate.get(tanggalKey) ?? [], "pengeluaran")
    for (const row of merged) {
      items.push({
        tanggalKey,
        kategori: kategoriLabel(row, "pengeluaran"),
        user: singleUnitLabel(row),
        namaBarang: namaBarangLabel(row) || "Tanpa nama",
        qty: num(row, "jumlah"),
      })
    }
  }

  items.sort((a, b) => {
    const byKat = a.kategori.localeCompare(b.kategori, "id")
    if (byKat !== 0) return byKat
    const byDate = b.tanggalKey.localeCompare(a.tanggalKey, "id")
    if (byDate !== 0) return byDate
    const byUser = a.user.localeCompare(b.user, "id")
    if (byUser !== 0) return byUser
    return a.namaBarang.localeCompare(b.namaBarang, "id")
  })
  return items
}

/**
 * Pengeluaran: Kategori → row Tanggal → User (span) → Item.
 * Total = qty (agregat jumlah).
 */
export function buildPengeluaranCategorySections(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
): { categories: PengeluaranCategorySection[]; grandQty: number } {
  const items = preparePengeluaranItems(rows)
  if (items.length === 0) return { categories: [], grandQty: 0 }

  const katOrder: string[] = []
  const byKat = new Map<string, PengeluaranItem[]>()
  for (const item of items) {
    const bucket = byKat.get(item.kategori)
    if (bucket) bucket.push(item)
    else {
      katOrder.push(item.kategori)
      byKat.set(item.kategori, [item])
    }
  }

  const categories: PengeluaranCategorySection[] = []
  let grandQty = 0

  for (const kategori of katOrder) {
    const catItems = byKat.get(kategori) ?? []
    const dateOrder: string[] = []
    const byDate = new Map<string, PengeluaranItem[]>()
    for (const item of catItems) {
      const bucket = byDate.get(item.tanggalKey)
      if (bucket) bucket.push(item)
      else {
        dateOrder.push(item.tanggalKey)
        byDate.set(item.tanggalKey, [item])
      }
    }

    const rowsOut: PengeluaranTableRow[] = []
    const usersSet = new Set<string>()
    let catQty = 0
    let itemCount = 0

    for (const tanggalKey of dateOrder) {
      const dateItems = byDate.get(tanggalKey) ?? []
      const tanggalLabel = formatTanggal(tanggalKey)

      rowsOut.push({
        type: "date-header",
        key: `${kategori}|${tanggalKey}|header`,
        label: tanggalLabel,
      })

      const userOrder: string[] = []
      const byUser = new Map<string, PengeluaranItem[]>()
      for (const item of dateItems) {
        usersSet.add(item.user)
        const bucket = byUser.get(item.user)
        if (bucket) bucket.push(item)
        else {
          userOrder.push(item.user)
          byUser.set(item.user, [item])
        }
      }

      let dateQty = 0
      for (const user of userOrder) {
        const userItems = byUser.get(user) ?? []
        const userRowSpan = userItems.length
        let userQty = 0
        let userShown = false

        for (const [index, item] of userItems.entries()) {
          userQty += item.qty
          itemCount += 1
          rowsOut.push({
            type: "item",
            key: `${kategori}|${tanggalKey}|${user}|${item.namaBarang}|${index}`,
            user,
            showUser: !userShown,
            userRowSpan,
            namaBarang: item.namaBarang,
            qty: item.qty,
            total: item.qty,
          })
          userShown = true
        }

        rowsOut.push({
          type: "user-subtotal",
          key: `${kategori}|${tanggalKey}|${user}|sub`,
          label: `Subtotal ${user}`,
          qty: userQty,
          total: userQty,
        })
        dateQty += userQty
      }

      rowsOut.push({
        type: "date-subtotal",
        key: `${kategori}|${tanggalKey}|date-sub`,
        label: `Subtotal ${tanggalLabel}`,
        qty: dateQty,
        total: dateQty,
      })
      catQty += dateQty
    }

    rowsOut.push({
      type: "category-subtotal",
      key: `${kategori}|cat-sub`,
      label: `Subtotal ${kategori}`,
      qty: catQty,
      total: catQty,
    })

    const users = Array.from(usersSet).sort((a, b) => a.localeCompare(b, "id"))
    categories.push({
      key: kategori,
      label: kategori,
      itemCount,
      users,
      qty: catQty,
      rows: rowsOut,
    })
    grandQty += catQty
  }

  return { categories, grandQty }
}

/** @deprecated gunakan buildPengeluaranCategorySections */
export function buildPengeluaranDaySections(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
) {
  const { categories, grandQty } = buildPengeluaranCategorySections(
    rows,
    formatTanggal
  )
  return { days: [], categories, grandQty }
}

/** @deprecated gunakan buildPengeluaranCategorySections */
export function buildPengeluaranTableRows(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
) {
  const { categories, grandQty } = buildPengeluaranCategorySections(
    rows,
    formatTanggal
  )
  return {
    rows: categories.flatMap((c) => c.rows),
    grandQty,
  }
}

const pengeluaranPdfLayout = {
  hLineWidth: () => 0.7,
  vLineWidth: () => 0.7,
  hLineColor: () => "#9ca3af",
  vLineColor: () => "#9ca3af",
  paddingLeft: () => 6,
  paddingRight: () => 6,
  paddingTop: () => 4,
  paddingBottom: () => 4,
}

/**
 * PDF: Kategori (satu blok/halaman) → row Tanggal → User span → Item.
 */
export function buildPengeluaranPdfContent(
  rows: Record<string, unknown>[],
  formatTanggal: (tanggalKey: string) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { blocks: any[]; grandQty: number } {
  const { categories, grandQty } = buildPengeluaranCategorySections(
    rows,
    formatTanggal
  )
  const widths = [70, "*", 42, 42]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks: any[] = []

  const header = [
    { text: "User", style: "tableHeader", alignment: "center" },
    { text: "Item name", style: "tableHeader", alignment: "center" },
    { text: "Qty", style: "tableHeader", alignment: "center" },
    { text: "Total", style: "tableHeader", alignment: "center" },
  ]

  categories.forEach((cat, catIndex) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any[][] = [header]

    for (const row of cat.rows) {
      if (row.type === "date-header") {
        body.push([
          {
            text: row.label,
            style: "sectionTitle",
            colSpan: 4,
            fillColor: "#e5e7eb",
          },
          {},
          {},
          {},
        ])
        continue
      }

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

      const style =
        row.type === "category-subtotal"
          ? "sectionTotal"
          : row.type === "date-subtotal"
            ? "sectionTotal"
            : "subtotal"
      const fill =
        row.type === "category-subtotal"
          ? "#e5e7eb"
          : row.type === "date-subtotal"
            ? "#f3f4f6"
            : null

      body.push([
        {
          text: row.label,
          style,
          colSpan: 2,
          alignment: "left",
          ...(fill ? { fillColor: fill } : {}),
        },
        {},
        {
          text: String(row.qty),
          style,
          alignment: "right",
          ...(fill ? { fillColor: fill } : {}),
        },
        {
          text: String(row.total),
          style,
          alignment: "right",
          ...(fill ? { fillColor: fill } : {}),
        },
      ])
    }

    blocks.push({
      stack: [
        {
          text: `Kategori: ${cat.label}   ·   ${cat.itemCount} item · ${cat.users.length} user · jml ${cat.qty}`,
          style: "sectionTitle",
          margin: [0, 0, 0, 6],
        },
        {
          table: { widths, headerRows: 1, body },
          layout: {
            ...pengeluaranPdfLayout,
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return "#f3f4f6"
              return null
            },
          },
        },
      ],
      pageBreak: catIndex > 0 ? "before" : undefined,
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
      ...pengeluaranPdfLayout,
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
