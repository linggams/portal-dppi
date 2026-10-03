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
import { groupLaporan, groupMeta } from "@/lib/purchasing/laporan-group"
import type { LaporanFilters, LaporanSummary } from "../types"

export function useLaporan() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTabState] = useState("permintaan")
  const [filters, setFiltersState] = useState<LaporanFilters>(() => ({
    ...getMonthToDateRangeWIB(),
    unit: "",
    status: "all",
  }))
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [summary, setSummary] = useState<LaporanSummary>({})
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

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
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      if (filters.unit) params.append("unit", filters.unit)
      if (filters.status !== "all") params.append("status", filters.status)
      params.set("page", String(currentPage))
      if (size) params.set("page_size", String(size))
      return params
    },
    [filters]
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
          toast.error("Gagal memuat data laporan")
        }
      } catch {
        toast.error("Terjadi kesalahan saat memuat data")
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
        return ["Tanggal", "Unit", "Nama Barang", "Jumlah", "Satuan", "Status"]
      case "pengajuan":
        return [
          "Tanggal",
          "Unit",
          "Nama Barang",
          "Jumlah",
          "Satuan",
          "Harga",
          "Total",
          "Status",
        ]
      case "pemasukan":
      case "pengeluaran":
        return ["Tanggal", "Unit", "Nama Barang", "Jumlah", "Satuan"]
      case "stok":
        return ["Kode Barang", "Nama Barang", "Stok", "Keluar", "Sisa", "Satuan"]
      default:
        return []
    }
  }

  const getRowData = (
    item: Record<string, unknown>,
    tab: string
  ): string[] => {
    switch (tab) {
      case "permintaan":
        return [
          formatDate(String(item.tglPermintaan ?? "")),
          String(item.unit ?? ""),
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String((item.stokbarang as { satuan?: string })?.satuan ?? ""),
          (item.status === 0
            ? "Pending"
            : item.status === 1
              ? "Disetujui"
              : "Ditolak") as string,
        ]
      case "pengajuan":
        return [
          formatDate(String(item.tglPengajuan ?? "")),
          String(item.unit ?? ""),
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String(item.satuan ?? ""),
          formatRupiah(Number(item.hargabarang ?? 0)),
          formatRupiah(Number(item.total ?? 0)),
          (item.status === 0
            ? "Pending"
            : item.status === 1
              ? "Disetujui"
              : "Ditolak") as string,
        ]
      case "pemasukan":
        return [
          formatDate(String(item.tglMasuk ?? "")),
          String(item.unit ?? ""),
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String((item.stokbarang as { satuan?: string })?.satuan ?? ""),
        ]
      case "pengeluaran":
        return [
          formatDate(String(item.tglKeluar ?? "")),
          String(item.unit ?? ""),
          String((item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""),
          String(item.jumlah ?? ""),
          String((item.stokbarang as { satuan?: string })?.satuan ?? ""),
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

  const handleExport = useCallback(async () => {
    try {
      const allRows: Record<string, unknown>[] = []
      let exportPage = 1
      let exportTotalPages = 1
      do {
        const params = buildParams(exportPage, MAX_PAGE_SIZE)
        const response = await fetch(
          `/api/purchasing/laporan/${activeTab}?${params.toString()}`
        )
        if (!response.ok) throw new Error("Gagal memuat data ekspor")
        const result = readPaginatedJson<Record<string, unknown>>(
          await response.json()
        )
        allRows.push(...result.data)
        exportTotalPages = result.totalPages
        exportPage += 1
      } while (exportPage <= exportTotalPages)

      if (allRows.length === 0) {
        toast.error("Tidak ada data untuk diekspor")
        return
      }

      const headers = getHeaders(activeTab)
      const groups = groupLaporan(allRows, activeTab)
      const colCount = headers.length

      const span = (text: string, style: string) => [
        { text, style, colSpan: colCount },
        ...Array.from({ length: colCount - 1 }, () => ({})),
      ]

      const subtotalCells = (group: (typeof groups)[number]) => {
        const label = { text: "Subtotal", style: "subtotal" }
        const empty = { text: "", style: "subtotal" }
        const qty = { text: String(group.jumlah), style: "subtotal" }
        if (activeTab === "pengajuan") {
          return [
            { ...label, colSpan: 3 },
            {},
            {},
            qty,
            empty,
            empty,
            { text: formatRupiah(group.total), style: "subtotal" },
            empty,
          ]
        }
        if (activeTab === "stok") {
          return [
            { ...label, colSpan: 2 },
            {},
            { text: String(group.stok), style: "subtotal" },
            { text: String(group.keluar), style: "subtotal" },
            { text: String(group.sisa), style: "subtotal" },
            empty,
          ]
        }
        return [
          { ...label, colSpan: 3 },
          {},
          {},
          qty,
          empty,
          ...(activeTab === "permintaan" ? [empty] : []),
        ]
      }

      const grand = groups.reduce(
        (sum, group) => ({
          jumlah: sum.jumlah + group.jumlah,
          total: sum.total + group.total,
          stok: sum.stok + group.stok,
          keluar: sum.keluar + group.keluar,
          sisa: sum.sisa + group.sisa,
        }),
        { jumlah: 0, total: 0, stok: 0, keluar: 0, sisa: 0 }
      )

      const grandCells = () => {
        const label = { text: "Total keseluruhan", style: "grandTotal" }
        const empty = { text: "", style: "grandTotal" }
        if (activeTab === "pengajuan") {
          return [
            { ...label, colSpan: 3 },
            {},
            {},
            { text: String(grand.jumlah), style: "grandTotal" },
            empty,
            empty,
            { text: formatRupiah(grand.total), style: "grandTotal" },
            empty,
          ]
        }
        if (activeTab === "stok") {
          return [
            { ...label, colSpan: 2 },
            {},
            { text: String(grand.stok), style: "grandTotal" },
            { text: String(grand.keluar), style: "grandTotal" },
            { text: String(grand.sisa), style: "grandTotal" },
            empty,
          ]
        }
        return [
          { ...label, colSpan: 3 },
          {},
          {},
          { text: String(grand.jumlah), style: "grandTotal" },
          empty,
          ...(activeTab === "permintaan" ? [empty] : []),
        ]
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        headers.map((h) => ({ text: h, style: "tableHeader" })),
      ]
      for (const group of groups) {
        body.push(
          span(
            `${group.kategori}    ${groupMeta(group, activeTab)}`,
            "groupHeader"
          )
        )
        for (const item of group.rows) {
          body.push(
            getRowData(item, activeTab).map((cell) => ({
              text: cell,
              style: "tableCell",
            }))
          )
        }
        body.push(subtotalCells(group))
      }
      body.push(grandCells())

      const filename = `laporan-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`
      const period =
        filters.startDate && filters.endDate
          ? `${formatDate(filters.startDate)} – ${formatDate(filters.endDate)}`
          : ""

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const widthsByTab: Record<string, any[]> = {
        permintaan: ["auto", "auto", "*", "auto", "auto", "auto"],
        pengajuan: ["auto", "auto", "*", "auto", "auto", "auto", "auto", "auto"],
        pemasukan: ["auto", "auto", "*", "auto", "auto"],
        pengeluaran: ["auto", "auto", "*", "auto", "auto"],
        stok: ["auto", "*", "auto", "auto", "auto", "auto"],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [30, 50, 30, 30],
        content: [
          ...companyPdfHeader({ lineWidth: 760, afterLine: 10 }),
          {
            text: `LAPORAN ${String(activeTab).toUpperCase()}`,
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 4],
          },
          ...(period
            ? [
                {
                  text: period,
                  style: "subheader",
                  alignment: "center",
                  margin: [0, 0, 0, 14],
                },
              ]
            : []),
          {
            table: {
              headerRows: 1,
              widths: widthsByTab[activeTab] || new Array(headers.length).fill("*"),
              body,
            },
            layout: "lightHorizontalLines",
          },
        ],
        styles: {
          header: { fontSize: 14, bold: true },
          subheader: { fontSize: 9 },
          title: { fontSize: 12, bold: true },
          tableHeader: {
            bold: true,
            fontSize: 9,
            fillColor: "#f3f4f6",
            alignment: "center",
          },
          groupHeader: {
            bold: true,
            fontSize: 9,
            fillColor: "#e5e7eb",
          },
          subtotal: { bold: true, fontSize: 9 },
          grandTotal: {
            bold: true,
            fontSize: 9,
            fillColor: "#f3f4f6",
          },
          tableCell: { fontSize: 9 },
        },
        defaultStyle: { fontSize: 9 },
      }

      downloadPdf(docDefinition, filename)
      toast.success("PDF berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh PDF")
    }
  }, [activeTab, buildParams, filters.endDate, filters.startDate])

  return {
    loading,
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
    handleExport,
    getHeaders,
    getRowData,
  }
}
