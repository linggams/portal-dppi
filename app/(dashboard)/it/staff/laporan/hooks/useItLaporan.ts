"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
import { formatJamAtauHari } from "@/lib/it/laporan"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import type {
  ItLaporanFilters,
  ItLaporanSummary,
  ItLaporanTab,
  KategoriLaporanItem,
  TeknisiLaporanItem,
  TiketLaporanItem,
} from "../types"
import { formatTiketDate } from "@/lib/it/utils"

export function useItLaporan() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTabState] = useState<ItLaporanTab>("tiket")
  const [filters, setFiltersState] = useState<ItLaporanFilters>(() => ({
    ...getMonthToDateRangeWIB(),
    status: "all",
    kategoriId: "all",
    username: "",
    ditugaskanKe: "",
    dateField: "dibuat",
  }))
  const [tiketData, setTiketData] = useState<TiketLaporanItem[]>([])
  const [kategoriData, setKategoriData] = useState<KategoriLaporanItem[]>([])
  const [teknisiData, setTeknisiData] = useState<TeknisiLaporanItem[]>([])
  const [summary, setSummary] = useState<ItLaporanSummary | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const setActiveTab = useCallback((tab: ItLaporanTab) => {
    setPage(1)
    setActiveTabState(tab)
  }, [])

  const setFilters = useCallback((next: ItLaporanFilters) => {
    setPage(1)
    setFiltersState(next)
  }, [])

  const buildParams = useCallback(
    (tab: ItLaporanTab, currentPage: number, size?: number) => {
      const params = new URLSearchParams({ tab })
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.kategoriId !== "all")
        params.append("kategori_id", filters.kategoriId)
      if (filters.username.trim())
        params.append("username", filters.username.trim())
      if (filters.ditugaskanKe.trim())
        params.append("ditugaskan_ke", filters.ditugaskanKe.trim())
      if (filters.dateField === "selesai")
        params.append("date_field", "selesai")
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
        const params = buildParams(activeTab, currentPage)
        const response = await fetch(`/api/it/laporan?${params.toString()}`)
        if (!response.ok) {
          toast.error("Gagal memuat data laporan")
          return
        }
        const json = await response.json()
        setSummary(json.summary ?? null)

        if (activeTab === "tiket") {
          const result = readPaginatedJson<TiketLaporanItem>(json)
          setTiketData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        } else if (activeTab === "kategori") {
          const result = readPaginatedJson<KategoriLaporanItem>(json)
          setKategoriData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        } else {
          const result = readPaginatedJson<TeknisiLaporanItem>(json)
          setTeknisiData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
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

  const rowDataFromItems = useCallback(
    (
      tab: ItLaporanTab,
      tiket: TiketLaporanItem[],
      kategori: KategoriLaporanItem[],
      teknisi: TeknisiLaporanItem[]
    ): string[][] => {
      switch (tab) {
        case "tiket":
          return tiket.map((t) => [
            t.nomorTiket,
            t.judul,
            t.username,
            t.kategori.nama,
            IT_TIKET_STATUS_LABEL[t.status] ?? String(t.status),
            t.ditugaskanKe ?? "-",
            formatTiketDate(t.tglDibuat),
            t.tglSelesai ? formatTiketDate(t.tglSelesai) : "-",
          ])
        case "kategori":
          return kategori.map((k) => [
            k.kategoriNama,
            String(k.total),
            String(k.dalamAntrian),
            String(k.selesai),
            formatJamAtauHari(k.rataRataJamSelesai),
          ])
        case "teknisi":
          return teknisi.map((t) => [
            t.ditugaskanKe,
            String(t.total),
            String(t.dalamAntrian),
            String(t.selesai),
            formatJamAtauHari(t.rataRataJamSelesai),
          ])
      }
    },
    []
  )

  const getHeaders = (tab: ItLaporanTab): string[] => {
    switch (tab) {
      case "tiket":
        return [
          "No. Tiket",
          "Judul",
          "Pemohon",
          "Kategori",
          "Status",
          "Teknisi",
          "Dibuat",
          "Selesai",
        ]
      case "kategori":
        return [
          "Kategori",
          "Total",
          "Antrian",
          "Selesai",
          "Rata-rata selesai",
        ]
      case "teknisi":
        return [
          "Teknisi",
          "Total",
          "Antrian",
          "Selesai",
          "Rata-rata selesai",
        ]
    }
  }

  const handleExport = useCallback(async () => {
    try {
      const allTiket: TiketLaporanItem[] = []
      const allKategori: KategoriLaporanItem[] = []
      const allTeknisi: TeknisiLaporanItem[] = []
      let exportPage = 1
      let exportTotalPages = 1
      do {
        const params = buildParams(activeTab, exportPage, MAX_PAGE_SIZE)
        const response = await fetch(`/api/it/laporan?${params.toString()}`)
        if (!response.ok) throw new Error("Gagal memuat data ekspor")
        const json = await response.json()
        if (activeTab === "tiket") {
          const result = readPaginatedJson<TiketLaporanItem>(json)
          allTiket.push(...result.data)
          exportTotalPages = result.totalPages
        } else if (activeTab === "kategori") {
          const result = readPaginatedJson<KategoriLaporanItem>(json)
          allKategori.push(...result.data)
          exportTotalPages = result.totalPages
        } else {
          const result = readPaginatedJson<TeknisiLaporanItem>(json)
          allTeknisi.push(...result.data)
          exportTotalPages = result.totalPages
        }
        exportPage += 1
      } while (exportPage <= exportTotalPages)

      const tableRows = rowDataFromItems(
        activeTab,
        allTiket,
        allKategori,
        allTeknisi
      )
      if (tableRows.length === 0) {
        toast.error("Tidak ada data untuk diekspor")
        return
      }

      const headers = getHeaders(activeTab)
      const filename = `laporan-it-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        headers.map((h) => ({ text: h, style: "tableHeader" })),
        ...tableRows.map((row) =>
          row.map((cell) => ({ text: cell, style: "tableCell" }))
        ),
      ]

      const widthsByTab: Record<ItLaporanTab, (string | number)[]> = {
        tiket: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto"],
        kategori: ["*", "auto", "auto", "auto", "auto"],
        teknisi: ["*", "auto", "auto", "auto", "auto"],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: activeTab === "tiket" ? "landscape" : "portrait",
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
            text: `LAPORAN TIKET IT — ${activeTab.toUpperCase()}`,
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 14],
          },
          {
            table: {
              headerRows: 1,
              widths: widthsByTab[activeTab],
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
  }, [activeTab, buildParams, rowDataFromItems])

  const currentData =
    activeTab === "tiket"
      ? tiketData
      : activeTab === "kategori"
        ? kategoriData
        : teknisiData

  return {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    tiketData,
    kategoriData,
    teknisiData,
    summary,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchData: handleFetch,
    handleExport,
    hasData: currentData.length > 0,
  }
}
