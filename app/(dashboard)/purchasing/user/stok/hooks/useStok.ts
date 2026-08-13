"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { StokBarang } from "../types"

export function useStok() {
  const searchParams = useSearchParams()
  const jenisParam = searchParams.get("jenis") || "1"

  const [stokBarang, setStokBarang] = useState<StokBarang[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStokBarang = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/purchasing/stok?id_jenis=${jenisParam}`)
      if (response.ok) {
        const data = await response.json()
        setStokBarang(data)
      }
    } catch {
      toast.error("Gagal memuat data stok barang")
    } finally {
      setLoading(false)
    }
  }, [jenisParam])

  useEffect(() => {
    fetchStokBarang()
  }, [fetchStokBarang])

  const formatRupiah = useCallback((value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }, [])

  return {
    stokBarang,
    loading,
    formatRupiah,
  }
}

