"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import type { StokBarang, JenisBarang, StokFormData } from "../types"

export function useStok() {
  const searchParams = useSearchParams()
  const jenisParam = searchParams.get("jenis") || "1"

  const [stokBarang, setStokBarang] = useState<StokBarang[]>([])
  const [jenisBarang, setJenisBarang] = useState<JenisBarang[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [jenisParam])

  const fetchJenisBarang = useCallback(async () => {
    try {
      const response = await fetch("/api/purchasing/jenis-barang")
      if (response.ok) {
        const data = await response.json()
        setJenisBarang(Array.isArray(data) ? data : [])
      } else {
        toast.error("Gagal memuat data jenis barang")
      }
    } catch {
      toast.error("Gagal memuat data jenis barang")
    }
  }, [])

  const fetchStokBarang = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("id_jenis", jenisParam)
      params.set("page", String(page))
      const response = await fetch(`/api/purchasing/stok?${params.toString()}`)
      if (response.ok) {
        const result = readPaginatedJson<StokBarang>(await response.json())
        setStokBarang(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      } else {
        toast.error("Gagal memuat data stok barang")
      }
    } catch {
      toast.error("Gagal memuat data stok barang")
    } finally {
      setLoading(false)
    }
  }, [jenisParam, page])

  useEffect(() => {
    fetchJenisBarang()
    fetchStokBarang()
  }, [fetchJenisBarang, fetchStokBarang])

  const fetchNextKode = async (idJenis: number) => {
    try {
      const res = await fetch(`/api/purchasing/stok/next-kode?id_jenis=${idJenis}`)
      if (res.ok) {
        const { nextKode } = await res.json()
        return nextKode
      }
    } catch {
      toast.error("Gagal generate kode barang")
    }
    return ""
  }

  const saveStok = async (
    formData: StokFormData,
    editingStok: StokBarang | null
  ): Promise<boolean> => {
    const url = editingStok
      ? `/api/purchasing/stok/${editingStok.idKodeBrg}`
      : "/api/purchasing/stok"
    const method = editingStok ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      toast.success(
        editingStok
          ? "Stok barang berhasil diupdate"
          : "Stok barang berhasil ditambahkan"
      )
      await fetchStokBarang()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Terjadi kesalahan")
    return false
  }

  const deleteStok = async (stok: StokBarang): Promise<boolean> => {
    const response = await fetch(`/api/purchasing/stok/${stok.idKodeBrg}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("Stok barang berhasil dihapus")
      await fetchStokBarang()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Terjadi kesalahan")
    return false
  }

  const getJenisName = (idJenis: number) => {
    const jenis = jenisBarang.find((j) => j.idJenis === idJenis)
    return jenis?.jenisBrg || "-"
  }

  const downloadPDF = async () => {
    try {
      const params = new URLSearchParams()
      params.set("id_jenis", jenisParam)
      params.set("page", "1")
      params.set("page_size", String(MAX_PAGE_SIZE))
      const response = await fetch(`/api/purchasing/stok?${params.toString()}`)
      if (!response.ok) {
        toast.error("Gagal memuat data untuk PDF")
        return
      }
      const result = readPaginatedJson<StokBarang>(await response.json())
      const exportRows = result.data

      if (!exportRows.length) {
        toast.error("Tidak ada data untuk diexport")
        return
      }

      const jenisName = getJenisName(parseInt(jenisParam))
      const today = new Date().toISOString().split("T")[0]
      const filename = `Laporan_Stok_${jenisName}_${today}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        [
          { text: "No", style: "tableHeader" },
          { text: "Kode Barang", style: "tableHeader" },
          { text: "Nama Barang", style: "tableHeader" },
          { text: "Harga", style: "tableHeader" },
          { text: "Satuan", style: "tableHeader" },
          { text: "Stok", style: "tableHeader" },
          { text: "Keluar", style: "tableHeader" },
          { text: "Sisa", style: "tableHeader" },
        ],
        ...exportRows.map((item, index) => [
          { text: String(index + 1), alignment: "center" },
          { text: item.kodeBrg },
          { text: item.namaBrg },
          { text: item.hargabarang.toString(), alignment: "right" },
          { text: item.satuan, alignment: "center" },
          { text: String(item.stok), alignment: "right" },
          { text: String(item.keluar), alignment: "right" },
          {
            text: String(item.sisa),
            alignment: "right",
            color: item.sisa < 0 ? "red" : item.sisa === 0 ? "#b45309" : undefined,
            bold: item.sisa <= 0,
          },
        ]),
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [40, 60, 40, 40],
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
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
            margin: [0, 0, 0, 8],
          },
          {
            text: `LAPORAN DATA STOK BARANG ${jenisName.toUpperCase()}`,
            style: "title",
            alignment: "center",
            margin: [0, 0, 0, 16],
          },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "auto", "*", "auto", "auto", "auto", "auto", "auto"],
              body,
            },
            layout: "lightHorizontalLines",
          },
        ],
        styles: {
          header: {
            fontSize: 14,
            bold: true,
          },
          subheader: {
            fontSize: 9,
          },
          title: {
            fontSize: 12,
            bold: true,
          },
          tableHeader: {
            bold: true,
            fontSize: 9,
            fillColor: "#f3f4f6",
            alignment: "center",
          },
        },
        defaultStyle: {
          fontSize: 9,
        },
      }

      downloadPdf(docDefinition, filename)
      toast.success("PDF berhasil diunduh")
    } catch (error) {
      console.error("Error generating PDF dengan pdfmake:", error)
      toast.error("Gagal mengunduh PDF")
    }
  }

  return {
    stokBarang,
    jenisBarang,
    loading,
    jenisParam,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchNextKode,
    saveStok,
    deleteStok,
    getJenisName,
    downloadPDF,
  }
}
