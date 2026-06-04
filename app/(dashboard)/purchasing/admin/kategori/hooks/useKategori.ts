"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { Kategori, KategoriFormData } from "../types"

export function useKategori() {
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(true)

  const fetchKategori = useCallback(async () => {
    try {
      const response = await fetch("/api/purchasing/jenis-barang")
      if (response.ok) {
        const data = await response.json()
        setKategori(data)
      } else {
        toast.error("Gagal memuat data kategori")
      }
    } catch {
      toast.error("Gagal memuat data kategori")
    } finally {
      setLoading(false)
    }
  }, [])

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

  return { kategori, loading, fetchKategori, addKategori, deleteKategori }
}
