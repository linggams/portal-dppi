"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { companyPdfHeader } from "@/lib/shared/app-branding"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import { formatDate, formatRupiah } from "../utils"
import {
  buildLaporanSectionsByKategori,
  buildPengeluaranPdfContent,
  isTransaksiTab,
  kategoriLabel,
  listKategoriOptions,
  unitLabel,
} from "@/lib/purchasing/laporan-group"
import type { LaporanFilters, LaporanSummary } from "../types"

export function useLaporan() {
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTabState] = useState("permintaan")
  const [filters, setFiltersState] = useState<LaporanFilters>(() => ({
    ...getMonthToDateRangeWIB(),
    status: "all",
  }))
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [summary, setSummary] = useState<LaporanSummary>({})
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportCategories, setExportCategories] = useState<string[]>([])
  const [exportSelected, setExportSelected] = useState<string[]>([])
  const [exportRows, setExportRows] = useState<Record<string, unknown>[]>([])

  const setActiveTab = useCallback((tab: string) => {
    setPage(1)
    setActiveTabState(tab)
  }, [])

  const setFilters = useCallback((next: LaporanFilters) => {
    setPage(1)
    setFiltersState(next)
  }, [])

  const buildParams = useCallback(
    (currentPage: number, size?: number) => {
      const params = new URLSearchParams()
      if (activeTab !== "stok") {
        if (filters.startDate) params.append("start_date", filters.startDate)
        if (filters.endDate) params.append("end_date", filters.endDate)
        if (
          (activeTab === "permintaan" || activeTab === "pengajuan") &&
          filters.status !== "all"
        ) {
          params.append("status", filters.status)
        }
      }
      params.set("page", String(currentPage))
      if (size) params.set("page_size", String(size))
      return params
    },
    [activeTab, filters]
  )

  const fetchData = useCallback(
    async (pageOverride?: number) => {
      const currentPage = pageOverride ?? page
      setLoading(true)
      try {
        const params = buildParams(currentPage)
        const response = await fetch(
          `/api/purchasing/laporan/${activeTab}?${params.toString()}`
        )
        if (response.ok) {
          const json = await response.json()
          const result = readPaginatedJson<Record<string, unknown>>(json)
          setData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
          setSummary(json.summary || {})
        } else {
          toast.error("Failed to load report data")
        }
      } catch {
        toast.error("An error occurred while loading data")
      } finally {
        setLoading(false)
      }
    },
    [activeTab, buildParams, page]
  )

  const handleFetch = useCallback(() => {
    setPage(1)
    void fetchData(1)
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getHeaders = (tab: string) => {
    switch (tab) {
      case "permintaan":
        return ["Item name", "Qty", "Unit", "User", "Status"]
      case "pengajuan":
        return [
          "Item name",
          "Qty",
          "Unit",
          "Price",
          "Total",
          "User",
          "Status",
        ]
      case "pemasukan":
      case "pengeluaran":
        return ["Item name", "Qty", "Unit", "User"]
      case "stok":
        return ["Item code", "Item name", "Stock", "Out", "Remaining", "Unit"]
      default:
        return []
    }
  }

  const statusLabel = (status: unknown) => {
    const n = Number(status)
    if (n === 0) return "Pending"
    if (n === 1) return "Approved"
    return "Rejected"
  }

  const getRowData = (
    item: Record<string, unknown>,
    tab: string
  ): string[] => {
    switch (tab) {
      case "permintaan":
        return [
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String((item.stokbarang as { satuan?: string })?.satuan ?? ""),
          unitLabel(item),
          statusLabel(item.status),
        ]
      case "pengajuan":
        return [
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String(item.satuan ?? ""),
          formatRupiah(Number(item.hargabarang ?? 0)),
          formatRupiah(Number(item.total ?? 0)),
          unitLabel(item),
          statusLabel(item.status),
        ]
      case "pemasukan":
      case "pengeluaran":
        return [
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String((item.stokbarang as { satuan?: string })?.satuan ?? ""),
          unitLabel(item),
        ]
      case "stok":
        return [
          String(item.kodeBrg ?? ""),
          String(item.namaBrg ?? ""),
          String(item.stok ?? ""),
          String(item.keluar ?? ""),
          String(item.sisa ?? ""),
          String(item.satuan ?? ""),
        ]
      default:
        return []
    }
  }

  const openExportDialog = useCallback(async () => {
    try {
      setExporting(true)
      const allRows: Record<string, unknown>[] = []
      let exportPage = 1
      let exportTotalPages = 1
      do {
        const params = buildParams(exportPage, MAX_PAGE_SIZE)
        const response = await fetch(
          `/api/purchasing/laporan/${activeTab}?${params.toString()}`
        )
        if (!response.ok) throw new Error("Failed to load export data")
        const result = readPaginatedJson<Record<string, unknown>>(
          await response.json()
        )
        allRows.push(...result.data)
        exportTotalPages = result.totalPages
        exportPage += 1
      } while (exportPage <= exportTotalPages)

      if (allRows.length === 0) {
        toast.error("No data to export")
        return
      }

      const categories = listKategoriOptions(allRows, activeTab)
      setExportRows(allRows)
      setExportCategories(categories)
      setExportSelected([...categories])
      setExportOpen(true)
    } catch {
      toast.error("Failed to prepare export")
    } finally {
      setExporting(false)
    }
  }, [activeTab, buildParams])

  const runExportPdf = useCallback(async () => {
    if (exportSelected.length === 0) {
      toast.error("Select at least one category")
      return
    }
    try {
      setExporting(true)

      const pageMargins: [number, number, number, number] = [28, 36, 28, 28]
      const landscape = activeTab === "pengajuan"
      const contentWidth = landscape
        ? 841.89 - pageMargins[0] - pageMargins[2]
        : 595.28 - pageMargins[0] - pageMargins[2]

      const gridLayout = {
        hLineWidth: () => 0.7,
        vLineWidth: () => 0.7,
        hLineColor: () => "#9ca3af",
        vLineColor: () => "#9ca3af",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [
        ...companyPdfHeader({ lineWidth: contentWidth, afterLine: 8 }),
        {
          text: `REPORT ${(
            {
              permintaan: "REQUESTS",
              pengajuan: "SUBMISSIONS",
              pemasukan: "INBOUND",
              pengeluaran: "OUTBOUND",
              stok: "STOCK",
            } as Record<string, string>
          )[activeTab] ?? String(activeTab).toUpperCase()}`,
          style: "title",
          alignment: "center",
          margin: [0, 2, 0, 2],
        },
      ]

      if (activeTab !== "stok" && filters.startDate && filters.endDate) {
        content.push({
          text: `${formatDate(filters.startDate)} – ${formatDate(filters.endDate)}`,
          style: "subheader",
          alignment: "center",
          margin: [0, 0, 0, 12],
        })
      } else {
        content.push({ text: " ", margin: [0, 0, 0, 8] })
      }

      // Pengeluaran: mirror UI — Hari → Kategori → User span
      if (activeTab === "pengeluaran") {
        const allow = new Set(exportSelected)
        const filtered = exportRows.filter((row) =>
          allow.has(kategoriLabel(row, "pengeluaran"))
        )
        if (filtered.length === 0) {
          toast.error("No data for selected categories")
          return
        }

        const { blocks } = buildPengeluaranPdfContent(filtered, formatDate)
        content.push(...blocks)
      } else {
        const headers = getHeaders(activeTab)
        const sections = buildLaporanSectionsByKategori(
          exportRows,
          activeTab,
          exportSelected
        )

        if (sections.length === 0) {
          toast.error("No data for selected categories")
          return
        }

        const transaksi = isTransaksiTab(activeTab)
        const rightAlignCols: Record<string, number[]> = {
          permintaan: [1],
          pengajuan: [1, 3, 4],
          pemasukan: [1],
          stok: [2, 3, 4],
        }
        const numericCols = new Set(rightAlignCols[activeTab] ?? [])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widthsByTab: Record<string, any[]> = {
          permintaan: ["*", 44, 44, "*", 58],
          pengajuan: ["*", 40, 40, 64, 70, "*", 54],
          pemasukan: ["*", 48, 48, "*"],
          stok: [58, "*", 42, 42, 42, 48],
        }
        const widths =
          widthsByTab[activeTab] || new Array(headers.length).fill("*")

        const cell = (
          text: string,
          style: string,
          colIndex?: number,
          extra?: Record<string, unknown>
        ) => ({
          text,
          style,
          alignment:
            colIndex !== undefined && numericCols.has(colIndex)
              ? "right"
              : style === "tableHeader"
                ? "center"
                : "left",
          ...extra,
        })

        const empty = (style: string) => ({ text: "", style })

        const summaryRow = (
          label: string,
          style: string,
          values: {
            jumlah?: number
            total?: number
            stok?: number
            keluar?: number
            sisa?: number
          }
        ) => {
          if (activeTab === "pengajuan") {
            return [
              cell(label, style, 0),
              cell(String(values.jumlah ?? 0), style, 1),
              empty(style),
              empty(style),
              cell(formatRupiah(values.total ?? 0), style, 4),
              empty(style),
              empty(style),
            ]
          }
          if (activeTab === "stok") {
            return [
              { text: label, style, colSpan: 2 },
              {},
              cell(String(values.stok ?? 0), style, 2),
              cell(String(values.keluar ?? 0), style, 3),
              cell(String(values.sisa ?? 0), style, 4),
              empty(style),
            ]
          }
          if (activeTab === "permintaan") {
            return [
              cell(label, style, 0),
              cell(String(values.jumlah ?? 0), style, 1),
              empty(style),
              empty(style),
              empty(style),
            ]
          }
          return [
            cell(label, style, 0),
            cell(String(values.jumlah ?? 0), style, 1),
            empty(style),
            empty(style),
          ]
        }

        const grand = sections.reduce(
          (sum, s) => ({
            jumlah: sum.jumlah + s.jumlah,
            total: sum.total + s.total,
            stok: sum.stok + s.stok,
            keluar: sum.keluar + s.keluar,
            sisa: sum.sisa + s.sisa,
          }),
          { jumlah: 0, total: 0, stok: 0, keluar: 0, sisa: 0 }
        )

        sections.forEach((section, sectionIndex) => {
          const sectionTitle = `${
            transaksi ? "Category: " : ""
          }${section.title}   ·   ${section.itemCount} item · qty ${
            activeTab === "stok" ? section.sisa : section.jumlah
          }`

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const categoryStack: any[] = [
            {
              columns: [
                {
                  canvas: [
                    {
                      type: "rect",
                      x: 0,
                      y: 0,
                      w: 3,
                      h: 12,
                      color: "#2563eb",
                    },
                  ],
                  width: 8,
                },
                {
                  text: sectionTitle,
                  style: "sectionTitle",
                  width: "*",
                },
              ],
              columnGap: 4,
              margin: [0, 0, 0, 6],
            },
          ]

          for (const group of section.groups) {
            const headerRow = headers.map((h, i) => cell(h, "tableHeader", i))
            const dataRows = group.rows.map((item) =>
              getRowData(item, activeTab).map((text, i) =>
                cell(text, "tableCell", i)
              )
            )

            categoryStack.push({
              table: {
                widths,
                headerRows: 1,
                body: [
                  headerRow,
                  ...dataRows,
                  summaryRow(`Subtotal ${section.title}`, "subtotal", group),
                ],
              },
              layout: {
                ...gridLayout,
                fillColor: (rowIndex: number) => {
                  if (rowIndex === 0) return "#f3f4f6"
                  return null
                },
              },
              margin: [0, 0, 0, 4],
            })
          }

          content.push({
            stack: categoryStack,
            pageBreak: sectionIndex > 0 ? "before" : undefined,
          })
        })

        content.push({
          table: {
            widths,
            body: [summaryRow("Grand total", "grandTotal", grand)],
          },
          layout: {
            ...gridLayout,
            fillColor: () => "#e5e7eb",
          },
          margin: [0, 12, 0, 0],
        })
      }

      const filename = `laporan-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: landscape ? "landscape" : "portrait",
        pageMargins,
        content,
        styles: {
          header: { fontSize: 13, bold: true },
          subheader: { fontSize: 8, color: "#4b5563" },
          title: { fontSize: 12, bold: true },
          sectionTitle: { fontSize: 10, bold: true },
          unitTitle: { fontSize: 9, bold: true },
          tableHeader: { bold: true, fontSize: 8 },
          subtotal: { bold: true, fontSize: 8 },
          sectionTotal: { bold: true, fontSize: 8 },
          grandTotal: { bold: true, fontSize: 9 },
          tableCell: { fontSize: 8 },
        },
        defaultStyle: { fontSize: 8 },
      }

      downloadPdf(docDefinition, filename)
      setExportOpen(false)
      toast.success("PDF downloaded successfully")
    } catch {
      toast.error("Failed to download PDF")
    } finally {
      setExporting(false)
    }
  }, [
    activeTab,
    exportRows,
    exportSelected,
    filters.endDate,
    filters.startDate,
  ])

  return {
    loading,
    exporting,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    data,
    summary,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchData: handleFetch,
    openExportDialog,
    exportOpen,
    setExportOpen,
    exportCategories,
    exportSelected,
    setExportSelected,
    runExportPdf,
  }
}
