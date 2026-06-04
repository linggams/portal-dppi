"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/makepdf"
import { IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
import { formatJamAtauHari } from "@/lib/it/laporan"
import type {
  ItLaporanFilters,
  ItLaporanSummary,
  ItLaporanTab,
  KategoriLaporanItem,
  TeknisiLaporanItem,
  TiketLaporanItem,
} from "../types"
import { formatTiketDate } from "../utils"

export function useItLaporan() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ItLaporanTab>("tiket")
  const [filters, setFilters] = useState<ItLaporanFilters>({
    startDate: "",
    endDate: "",
    status: "all",
    prioritas: "all",
    kategoriId: "all",
    username: "",
    ditugaskanKe: "",
    dateField: "dibuat",
  })
  const [tiketData, setTiketData] = useState<TiketLaporanItem[]>([])
  const [kategoriData, setKategoriData] = useState<KategoriLaporanItem[]>([])
  const [teknisiData, setTeknisiData] = useState<TeknisiLaporanItem[]>([])
  const [summary, setSummary] = useState<ItLaporanSummary | null>(null)

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFilters((prev) => ({
      ...prev,
      startDate: firstDay.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    }))
  }, [])

  const buildParams = useCallback(
    (tab: ItLaporanTab) => {
      const params = new URLSearchParams({ tab })
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.prioritas !== "all")
        params.append("prioritas", filters.prioritas)
      if (filters.kategoriId !== "all")
        params.append("kategori_id", filters.kategoriId)
      if (filters.username.trim())
        params.append("username", filters.username.trim())
      if (filters.ditugaskanKe.trim())
        params.append("ditugaskan_ke", filters.ditugaskanKe.trim())
      if (filters.dateField === "selesai")
        params.append("date_field", "selesai")
      return params
    },
    [filters]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildParams(activeTab)
      const response = await fetch(`/api/it/laporan?${params.toString()}`)
      if (!response.ok) {
        toast.error("Gagal memuat data laporan")
        return
      }
      const result = await response.json()
      setSummary(result.summary ?? null)

      if (activeTab === "tiket") {
        setTiketData(result.data ?? [])
      } else if (activeTab === "kategori") {
        setKategoriData(result.data ?? [])
      } else {
        setTeknisiData(result.data ?? [])
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }, [activeTab, buildParams])

  useEffect(() => {
    if (filters.startDate || filters.endDate) {
      fetchData()
    }
  }, [activeTab, filters, fetchData])

  const getHeaders = (tab: ItLaporanTab): string[] => {
    switch (tab) {
      case "tiket":
        return [
          "No. Tiket",
          "Judul",
          "Pemohon",
          "Kategori",
          "Prioritas",
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

  const getRowData = (tab: ItLaporanTab): string[][] => {
    switch (tab) {
      case "tiket":
        return tiketData.map((t) => [
          t.nomorTiket,
          t.judul,
          t.username,
          t.kategori.nama,
          t.prioritas,
          IT_TIKET_STATUS_LABEL[t.status] ?? String(t.status),
          t.ditugaskanKe ?? "-",
          formatTiketDate(t.tglDibuat),
          t.tglSelesai ? formatTiketDate(t.tglSelesai) : "-",
        ])
      case "kategori":
        return kategoriData.map((k) => [
          k.kategoriNama,
          String(k.total),
          String(k.dalamAntrian),
          String(k.selesai),
          formatJamAtauHari(k.rataRataJamSelesai),
        ])
      case "teknisi":
        return teknisiData.map((t) => [
          t.ditugaskanKe,
          String(t.total),
          String(t.dalamAntrian),
          String(t.selesai),
          formatJamAtauHari(t.rataRataJamSelesai),
        ])
    }
  }

  const handleExport = useCallback(async () => {
    try {
      const headers = getHeaders(activeTab)
      const tableRows = getRowData(activeTab)
      const filename = `laporan-it-${activeTab}-${new Date().toISOString().split("T")[0]}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        headers.map((h) => ({ text: h, style: "tableHeader" })),
        ...tableRows.map((row) =>
          row.map((cell) => ({ text: cell, style: "tableCell" }))
        ),
      ]

      const widthsByTab: Record<ItLaporanTab, (string | number)[]> = {
        tiket: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
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
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 1 }],
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
  }, [activeTab, tiketData, kategoriData, teknisiData])

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
    fetchData,
    handleExport,
    hasData: currentData.length > 0,
  }
}
