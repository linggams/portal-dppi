import ExcelJS from "exceljs"
import type { MobilLaporanKm } from "./mobil-types"

/** Nama sheet Excel: maks 31 karakter, tanpa \ / ? * [ ] */
function toSheetName(nopol: string, used: Set<string>) {
  let base = nopol.replace(/[\\/?*[\]]/g, " ").trim() || "NOPOL"
  base = base.slice(0, 31)
  let name = base
  let i = 2
  while (used.has(name.toLowerCase())) {
    const suffix = ` (${i})`
    name = `${base.slice(0, Math.max(1, 31 - suffix.length))}${suffix}`
    i += 1
  }
  used.add(name.toLowerCase())
  return name
}

type DataRow = {
  tanggal: string
  idLaporan: number
  username: string
  jabatan: string
  kmAwal: number
  kmAkhir: number
  urutan: number | ""
  dari: string
  jamDari: string
  ke: string
  jamKe: string
  km: number | ""
  tol: number | ""
  bukti: string
}

const HEADERS = [
  "Tanggal",
  "Pelapor",
  "Jabatan",
  "KM awal",
  "KM akhir",
  "No",
  "Dari",
  "Jam dari",
  "Ke",
  "Jam ke",
  "KM",
  "Tol (Rp)",
  "Bukti",
] as const

const COL_WIDTHS = [14, 16, 18, 11, 11, 6, 22, 10, 22, 10, 10, 14, 12]

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFCBD5E1" } },
  left: { style: "thin", color: { argb: "FFCBD5E1" } },
  bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
  right: { style: "thin", color: { argb: "FFCBD5E1" } },
}

function applyDataCellStyle(
  cell: ExcelJS.Cell,
  opts?: { align?: ExcelJS.Alignment["horizontal"]; bold?: boolean }
) {
  cell.border = thinBorder
  cell.alignment = {
    vertical: "middle",
    horizontal: opts?.align ?? "left",
    wrapText: true,
  }
  cell.font = {
    name: "Calibri",
    size: 11,
    bold: opts?.bold ?? false,
    color: { argb: "FF0F172A" },
  }
}

function mergeVertical(
  sheet: ExcelJS.Worksheet,
  col: number,
  startRow: number,
  endRow: number
) {
  if (endRow <= startRow) return
  sheet.mergeCells(startRow, col, endRow, col)
  const cell = sheet.getCell(startRow, col)
  cell.alignment = {
    vertical: "middle",
    horizontal: col >= 4 && col <= 5 ? "right" : "left",
    wrapText: true,
  }
}

function buildDataRows(laporanList: MobilLaporanKm[]): DataRow[] {
  const sorted = laporanList.slice().sort((a, b) => {
    if (a.tanggal !== b.tanggal) return a.tanggal.localeCompare(b.tanggal)
    return a.idLaporan - b.idLaporan
  })

  const rows: DataRow[] = []
  for (const laporan of sorted) {
    const trips =
      laporan.perjalanan.length > 0
        ? laporan.perjalanan.slice().sort((a, b) => a.urutan - b.urutan)
        : [null]

    for (const trip of trips) {
      rows.push({
        tanggal: laporan.tanggal,
        idLaporan: laporan.idLaporan,
        username: laporan.username,
        jabatan: laporan.jabatan || "—",
        kmAwal: laporan.kmAwal,
        kmAkhir: laporan.kmAkhir,
        urutan: trip?.urutan ?? "",
        dari: trip?.dari ?? "",
        jamDari: trip?.jamDari ?? "",
        ke: trip?.ke ?? "",
        jamKe: trip?.jamKe ?? "",
        km: trip?.km ?? "",
        tol: trip?.tol ?? "",
        bukti: trip ? (trip.buktiPath ? "Ada" : "Tidak ada") : "",
      })
    }
  }
  return rows
}

function applyDateAndLaporanMerges(
  sheet: ExcelJS.Worksheet,
  dataRows: DataRow[],
  firstDataRow: number
) {
  // Merge Tanggal (col 1) for consecutive same date
  let dateStart = 0
  for (let i = 1; i <= dataRows.length; i++) {
    const same =
      i < dataRows.length && dataRows[i].tanggal === dataRows[dateStart].tanggal
    if (same) continue
    mergeVertical(
      sheet,
      1,
      firstDataRow + dateStart,
      firstDataRow + i - 1
    )
    dateStart = i
  }

  // Merge Pelapor–KM akhir (col 2–5) for same laporan block
  let lapStart = 0
  for (let i = 1; i <= dataRows.length; i++) {
    const same =
      i < dataRows.length &&
      dataRows[i].idLaporan === dataRows[lapStart].idLaporan
    if (same) continue
    const start = firstDataRow + lapStart
    const end = firstDataRow + i - 1
    for (const col of [2, 3, 4, 5]) {
      mergeVertical(sheet, col, start, end)
    }
    lapStart = i
  }
}

/**
 * Export seluruh perjalanan dari daftar laporan.
 * Setiap nopol = 1 sheet; tanggal sama digabung (merge).
 */
export async function downloadMobilLaporanListExcel(
  rows: MobilLaporanKm[],
  meta?: { startDate?: string; endDate?: string }
) {
  if (rows.length === 0) {
    throw new Error("Tidak ada data untuk diekspor")
  }

  const byNopol = new Map<string, MobilLaporanKm[]>()
  for (const row of rows) {
    const nopol = row.kendaraan?.nopol ?? `ID${row.idKendaraan}`
    const list = byNopol.get(nopol) ?? []
    list.push(row)
    byNopol.set(nopol, list)
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "Portal DPPI"
  workbook.created = new Date()

  const usedNames = new Set<string>()
  const sortedNopol = [...byNopol.keys()].sort((a, b) => a.localeCompare(b, "id"))
  const periode =
    meta?.startDate || meta?.endDate
      ? `${meta?.startDate || "…"} s/d ${meta?.endDate || "…"}`
      : "Semua periode"

  for (const nopol of sortedNopol) {
    const dataRows = buildDataRows(byNopol.get(nopol) ?? [])
    const sheet = workbook.addWorksheet(toSheetName(nopol, usedNames), {
      views: [{ state: "frozen", ySplit: 3 }],
      properties: { defaultRowHeight: 18 },
    })

    COL_WIDTHS.forEach((w, i) => {
      sheet.getColumn(i + 1).width = w
    })

    // Title
    sheet.mergeCells(1, 1, 1, HEADERS.length)
    const title = sheet.getCell(1, 1)
    title.value = `Laporan Perjalanan Mobil — ${nopol}`
    title.font = {
      name: "Calibri",
      size: 14,
      bold: true,
      color: { argb: "FF0F172A" },
    }
    title.alignment = { vertical: "middle", horizontal: "left" }
    sheet.getRow(1).height = 24

    // Subtitle / periode
    sheet.mergeCells(2, 1, 2, HEADERS.length)
    const subtitle = sheet.getCell(2, 1)
    subtitle.value = `Periode: ${periode}`
    subtitle.font = {
      name: "Calibri",
      size: 10,
      italic: true,
      color: { argb: "FF64748B" },
    }
    subtitle.alignment = { vertical: "middle", horizontal: "left" }
    sheet.getRow(2).height = 18

    // Header
    const headerRowIndex = 3
    const headerRow = sheet.getRow(headerRowIndex)
    headerRow.height = 22
    HEADERS.forEach((label, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = label
      cell.font = {
        name: "Calibri",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E3A5F" },
      }
      cell.border = thinBorder
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      }
    })

    const firstDataRow = 4
    dataRows.forEach((row, idx) => {
      const excelRow = sheet.getRow(firstDataRow + idx)
      excelRow.height = 18
      const values: Array<string | number> = [
        row.tanggal,
        row.username,
        row.jabatan,
        row.kmAwal,
        row.kmAkhir,
        row.urutan,
        row.dari,
        row.jamDari,
        row.ke,
        row.jamKe,
        row.km,
        row.tol,
        row.bukti,
      ]
      values.forEach((value, colIdx) => {
        const cell = excelRow.getCell(colIdx + 1)
        cell.value = value
        // 0 Tanggal … 5 No, 6 Dari, 7 Jam dari, 8 Ke, 9 Jam ke, 10 KM, 11 Tol, 12 Bukti
        const rightAlign =
          colIdx === 3 || colIdx === 4 || colIdx === 10 || colIdx === 11
        const centerAlign =
          colIdx === 5 || colIdx === 7 || colIdx === 9 || colIdx === 12
        applyDataCellStyle(cell, {
          align: centerAlign ? "center" : rightAlign ? "right" : "left",
        })
        if (
          typeof value === "number" &&
          (colIdx === 3 || colIdx === 4 || colIdx === 10 || colIdx === 11)
        ) {
          cell.numFmt = "#,##0"
        }
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          }
        }
      })
    })

    applyDateAndLaporanMerges(sheet, dataRows, firstDataRow)

    // Totals footer
    const totalKm = dataRows.reduce(
      (sum, r) => sum + (typeof r.km === "number" ? r.km : 0),
      0
    )
    const totalTol = dataRows.reduce(
      (sum, r) => sum + (typeof r.tol === "number" ? r.tol : 0),
      0
    )
    const footerRowIndex = firstDataRow + dataRows.length
    const footer = sheet.getRow(footerRowIndex)
    footer.height = 20
    sheet.mergeCells(footerRowIndex, 1, footerRowIndex, 10)
    const footerLabel = footer.getCell(1)
    footerLabel.value = "Total"
    footerLabel.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FF0F172A" },
    }
    footerLabel.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    }
    footerLabel.border = thinBorder
    footerLabel.alignment = { vertical: "middle", horizontal: "right" }

    for (const col of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const c = footer.getCell(col)
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2E8F0" },
      }
      c.border = thinBorder
    }

    const kmCell = footer.getCell(11)
    kmCell.value = totalKm
    kmCell.numFmt = "#,##0"
    kmCell.font = { name: "Calibri", size: 11, bold: true }
    kmCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    }
    kmCell.border = thinBorder
    kmCell.alignment = { vertical: "middle", horizontal: "right" }

    const tolCell = footer.getCell(12)
    tolCell.value = totalTol
    tolCell.numFmt = "#,##0"
    tolCell.font = { name: "Calibri", size: 11, bold: true }
    tolCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    }
    tolCell.border = thinBorder
    tolCell.alignment = { vertical: "middle", horizontal: "right" }

    const buktiFooter = footer.getCell(13)
    buktiFooter.value = ""
    buktiFooter.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    }
    buktiFooter.border = thinBorder
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  const start = meta?.startDate || "all"
  const end = meta?.endDate || "all"
  anchor.href = url
  anchor.download = `LaporanMobil_Perjalanan_${start}_${end}.xlsx`
  anchor.click()
  URL.revokeObjectURL(url)
}
