"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { companyPdfHeader } from "@/lib/shared/app-branding"
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import type { StokBarang, JenisBarang, StokFormData, StokSort, StokSortDir } from "../types"

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
  const [sort, setSortState] = useState<StokSort>("")
  const [sortDir, setSortDirState] = useState<StokSortDir>("desc")

  const setSort = useCallback((next: StokSort) => {
    setPage(1)
    setSortState(next)
  }, [])

  const setSortDir = useCallback((next: StokSortDir) => {
    setPage(1)
    setSortDirState(next)
  }, [])

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
        toast.error("Failed to load item types")
      }
    } catch {
      toast.error("Failed to load item types")
    }
  }, [])

  const fetchStokBarang = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("id_jenis", jenisParam)
      params.set("page", String(page))
      if (sort) {
        params.set("sort", sort)
        params.set("dir", sortDir)
      }
      const response = await fetch(`/api/purchasing/stok?${params.toString()}`)
      if (response.ok) {
        const result = readPaginatedJson<StokBarang>(await response.json())
        setStokBarang(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      } else {
        toast.error("Failed to load item stock")
      }
    } catch {
      toast.error("Failed to load item stock")
    } finally {
      setLoading(false)
    }
  }, [jenisParam, page, sort, sortDir])

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
      toast.error("Failed to generate item code")
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
          ? "Item stock updated successfully"
          : "Item stock added successfully"
      )
      await fetchStokBarang()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "An error occurred")
    return false
  }

  const deleteStok = async (stok: StokBarang): Promise<boolean> => {
    const response = await fetch(`/api/purchasing/stok/${stok.idKodeBrg}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("Item stock deleted successfully")
      await fetchStokBarang()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "An error occurred")
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
      if (sort) {
        params.set("sort", sort)
        params.set("dir", sortDir)
      }
      const response = await fetch(`/api/purchasing/stok?${params.toString()}`)
      if (!response.ok) {
        toast.error("Failed to load data for PDF")
        return
      }
      const result = readPaginatedJson<StokBarang>(await response.json())
      const exportRows = result.data

      if (!exportRows.length) {
        toast.error("No data to export")
        return
      }

      const jenisName = getJenisName(parseInt(jenisParam))
      const today = new Date().toISOString().split("T")[0]
      const filename = `Stock_Report_${jenisName}_${today}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        [
          { text: "No", style: "tableHeader" },
          { text: "Item code", style: "tableHeader" },
          { text: "Item name", style: "tableHeader" },
          { text: "Price", style: "tableHeader" },
          { text: "Unit", style: "tableHeader" },
          { text: "Stock", style: "tableHeader" },
          { text: "Out", style: "tableHeader" },
          { text: "Remaining", style: "tableHeader" },
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
            color: item.sisa <= 0 ? "red" : undefined,
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
          ...companyPdfHeader({ lineWidth: 515 }),
          {
            text: `ITEM STOCK REPORT ${jenisName.toUpperCase()}`,
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
      toast.success("PDF downloaded successfully")
    } catch (error) {
      console.error("Error generating PDF dengan pdfmake:", error)
      toast.error("Failed to download PDF")
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
    sort,
    setSort,
    sortDir,
    setSortDir,
    fetchNextKode,
    saveStok,
    deleteStok,
    getJenisName,
    downloadPDF,
  }
}
