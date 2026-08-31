"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { DANA_STATUS_LABEL } from "@/lib/dana/constants"
import { formatDanaDateOnly, formatRupiah } from "@/lib/dana/format"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import type {
  DanaLaporanByJabatan,
  DanaLaporanFilterState,
  DanaLaporanRow,
  DanaLaporanSummary,
  DanaLaporanTab,
} from "../types"

function defaultFilters(): DanaLaporanFilterState {
  return {
    ...getMonthToDateRangeWIB(),
    status: "all",
    q: "",
    jabatan: "",
  }
}

export function useDanaLaporan() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTabState] = useState<DanaLaporanTab>("daftar")
  const [filters, setFiltersState] =
    useState<DanaLaporanFilterState>(defaultFilters)
  const [daftarData, setDaftarData] = useState<DanaLaporanRow[]>([])
  const [jabatanData, setJabatanData] = useState<DanaLaporanByJabatan[]>([])
  const [summary, setSummary] = useState<DanaLaporanSummary | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const setActiveTab = useCallback((tab: DanaLaporanTab) => {
    setPage(1)
    setActiveTabState(tab)
  }, [])

  const setFilters = useCallback((next: DanaLaporanFilterState) => {
    setPage(1)
    setFiltersState(next)
  }, [])

  const buildParams = useCallback(
    (currentPage: number, size?: number) => {
      const params = new URLSearchParams({ tab: activeTab })
      if (filters.startDate) params.set("start_date", filters.startDate)
      if (filters.endDate) params.set("end_date", filters.endDate)
      if (filters.status !== "all") params.set("status", filters.status)
      if (filters.q.trim()) params.set("q", filters.q.trim())
      if (filters.jabatan.trim()) params.set("jabatan", filters.jabatan.trim())
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
        const response = await fetch(
          `/api/dana/laporan?${buildParams(currentPage).toString()}`
        )
        if (!response.ok) {
          toast.error("Gagal memuat laporan dana")
          return
        }
        const json = await response.json()
        setSummary(json.summary ?? null)
        if (activeTab === "jabatan") {
          const result = readPaginatedJson<DanaLaporanByJabatan>(json)
          setJabatanData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        } else {
          const result = readPaginatedJson<DanaLaporanRow>(json)
          setDaftarData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        }
      } catch {
        toast.error("Terjadi kesalahan saat memuat laporan")
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

  const resetFilters = () => {
    setPage(1)
    setFiltersState(defaultFilters())
  }

  const handleExport = useCallback(async () => {
    try {
      const isDaftar = activeTab === "daftar"
      const allDaftar: DanaLaporanRow[] = []
      const allJabatan: DanaLaporanByJabatan[] = []
      let exportPage = 1
      let exportTotalPages = 1
      do {
        const response = await fetch(
          `/api/dana/laporan?${buildParams(exportPage, MAX_PAGE_SIZE).toString()}`
        )
        if (!response.ok) throw new Error("Gagal memuat data ekspor")
        const json = await response.json()
        if (isDaftar) {
          const result = readPaginatedJson<DanaLaporanRow>(json)
          allDaftar.push(...result.data)
          exportTotalPages = result.totalPages
        } else {
          const result = readPaginatedJson<DanaLaporanByJabatan>(json)
          allJabatan.push(...result.data)
          exportTotalPages = result.totalPages
        }
        exportPage += 1
      } while (exportPage <= exportTotalPages)

      const headers = isDaftar
        ? [
            "Nomor",
            "Tanggal",
            "Pemohon",
            "Jabatan",
            "Nominal",
            "Terpakai",
            "Status",
            "Keperluan",
          ]
        : [
            "Jabatan",
            "Total",
            "Disetujui",
            "Ditolak",
            "Pending",
            "Nominal disetujui",
            "Dana terpakai",
          ]

      const tableRows = isDaftar
        ? allDaftar.map((row) => [
            row.nomor,
            formatDanaDateOnly(row.tglDibuat),
            row.username,
            row.jabatan,
            formatRupiah(row.nominal),
            formatRupiah(row.terpakai),
            DANA_STATUS_LABEL[row.status] ?? String(row.status),
            row.keperluan,
          ])
        : allJabatan.map((row) => [
            row.jabatan,
            String(row.total),
            String(row.approved),
            String(row.rejected),
            String(row.pending),
            formatRupiah(row.nominalDisetujui),
            formatRupiah(row.danaTerpakai),
          ])

      if (tableRows.length === 0) {
        toast.error("Tidak ada data untuk diekspor")
        return
      }

      const body = [
        headers.map((h) => ({ text: h, style: "tableHeader" })),
        ...tableRows.map((row) =>
          row.map((cell) => ({ text: cell, style: "tableCell" }))
        ),
      ]

      const docDefinition = {
        pageSize: "A4",
        pageOrientation: isDaftar ? "landscape" : "portrait",
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
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: isDaftar ? 760 : 535,
                y2: 0,
                lineWidth: 1,
              },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            text: `LAPORAN PENGAJUAN DANA — ${isDaftar ? "DAFTAR" : "PER JABATAN"}`,
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 14],
          },
          {
            table: {
              headerRows: 1,
              widths: isDaftar
                ? ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "*"]
                : ["*", "auto", "auto", "auto", "auto", "auto", "auto"],
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

      downloadPdf(
        docDefinition,
        `laporan-dana-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`
      )
      toast.success("PDF berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh PDF")
    }
  }, [activeTab, buildParams])

  const hasData =
    activeTab === "daftar" ? daftarData.length > 0 : jabatanData.length > 0

  return {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
    daftarData,
    jabatanData,
    summary,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchData: handleFetch,
    handleExport,
    hasData,
  }
}
