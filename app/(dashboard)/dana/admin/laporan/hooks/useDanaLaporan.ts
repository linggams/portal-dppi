"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/makepdf"
import { DANA_STATUS_LABEL } from "@/lib/dana/constants"
import { formatDanaDateOnly, formatRupiah } from "@/lib/dana/format"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
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
  const [activeTab, setActiveTab] = useState<DanaLaporanTab>("daftar")
  const [filters, setFilters] = useState<DanaLaporanFilterState>(defaultFilters)
  const [daftarData, setDaftarData] = useState<DanaLaporanRow[]>([])
  const [jabatanData, setJabatanData] = useState<DanaLaporanByJabatan[]>([])
  const [summary, setSummary] = useState<DanaLaporanSummary | null>(null)

  const buildParams = useCallback(() => {
    const params = new URLSearchParams({ tab: activeTab })
    if (filters.startDate) params.set("start_date", filters.startDate)
    if (filters.endDate) params.set("end_date", filters.endDate)
    if (filters.status !== "all") params.set("status", filters.status)
    if (filters.q.trim()) params.set("q", filters.q.trim())
    if (filters.jabatan.trim()) params.set("jabatan", filters.jabatan.trim())
    return params
  }, [activeTab, filters])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dana/laporan?${buildParams().toString()}`)
      if (!response.ok) {
        toast.error("Gagal memuat laporan dana")
        return
      }
      const result = await response.json()
      setSummary(result.summary ?? null)
      if (activeTab === "jabatan") {
        setJabatanData(Array.isArray(result.data) ? result.data : [])
      } else {
        setDaftarData(Array.isArray(result.data) ? result.data : [])
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat laporan")
    } finally {
      setLoading(false)
    }
  }, [activeTab, buildParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetFilters = () => {
    setFilters(defaultFilters())
  }

  const handleExport = useCallback(() => {
    try {
      const isDaftar = activeTab === "daftar"
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
        ? daftarData.map((row) => [
            row.nomor,
            formatDanaDateOnly(row.tglDibuat),
            row.username,
            row.jabatan,
            formatRupiah(row.nominal),
            formatRupiah(row.terpakai),
            DANA_STATUS_LABEL[row.status] ?? String(row.status),
            row.keperluan,
          ])
        : jabatanData.map((row) => [
            row.jabatan,
            String(row.total),
            String(row.approved),
            String(row.rejected),
            String(row.pending),
            formatRupiah(row.nominalDisetujui),
            formatRupiah(row.danaTerpakai),
          ])

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
  }, [activeTab, daftarData, jabatanData])

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
    fetchData,
    handleExport,
    hasData,
  }
}
