"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import { formatDate, formatRupiah } from "../utils"
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
      const tableRows = allRows.map((item) => getRowData(item, activeTab))

      const filename = `laporan-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        headers.map((h) => ({ text: h, style: "tableHeader" })),
        ...tableRows.map((row) =>
          row.map((cell) => ({ text: cell, style: "tableCell" }))
        ),
      ]

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
          {
            text: "PT DASAN PAN PACIFIC INDONESIA",
            style: "header",
            alignment: "center",
          },
          {
            text: "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355",
            style: "subheader",
            alignment: "center",
            margin: [0, 4, 0, 8],
          },
          {
            canvas: [
              { type: "line", x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 1 },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            text: `LAPORAN ${String(activeTab).toUpperCase()}`,
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 14],
          },
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
          tableCell: { fontSize: 9 },
        },
        defaultStyle: { fontSize: 9 },
      }

      downloadPdf(docDefinition, filename)
      toast.success("PDF berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh PDF")
    }
  }, [activeTab, buildParams])

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
