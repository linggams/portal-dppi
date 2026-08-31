"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { Kategori, KategoriFormData } from "../types"

export function useKategori() {
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const fetchKategori = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      const response = await fetch(
        `/api/purchasing/jenis-barang?${params.toString()}`
      )
      if (response.ok) {
        const result = readPaginatedJson<Kategori>(await response.json())
        setKategori(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      } else {
        toast.error("Gagal memuat data kategori")
      }
    } catch {
      toast.error("Gagal memuat data kategori")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchKategori()
  }, [fetchKategori])

  const addKategori = async (formData: KategoriFormData) => {
    const response = await fetch("/api/purchasing/jenis-barang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jenisBrg: formData.jenisBrg.trim() }),
    })

    if (response.ok) {
      toast.success("Kategori berhasil ditambahkan")
      await fetchKategori()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Gagal menambahkan kategori")
    return false
  }

  const deleteKategori = async (item: Kategori) => {
    const response = await fetch(`/api/purchasing/jenis-barang/${item.idJenis}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("Kategori berhasil dihapus")
      await fetchKategori()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Gagal menghapus kategori")
    return false
  }

  return {
    kategori,
    loading,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchKategori,
    addKategori,
    deleteKategori,
  }
}
