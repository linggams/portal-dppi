"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import type { StokBarang, JenisBarang } from "../types"

export function useStok() {
  const searchParams = useSearchParams()
  const jenisParam = searchParams.get("jenis") || "1"

  const [stokBarang, setStokBarang] = useState<StokBarang[]>([])
  const [jenisBarang, setJenisBarang] = useState<JenisBarang[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJenisBarang = useCallback(async () => {
    try {
      const response = await fetch("/api/purchasing/jenis-barang")
      if (response.ok) {
        const data = await response.json()
        setJenisBarang(data)
      }
    } catch (error) {
      toast.error("Gagal memuat data jenis barang")
    }
  }, [])

  const fetchStokBarang = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/purchasing/stok?id_jenis=${jenisParam}`)
      if (response.ok) {
        const data = await response.json()
        setStokBarang(data)
      }
    } catch (error) {
      toast.error("Gagal memuat data stok barang")
    } finally {
      setLoading(false)
    }
  }, [jenisParam])

  useEffect(() => {
    fetchJenisBarang()
    fetchStokBarang()
  }, [fetchJenisBarang, fetchStokBarang])

  const getJenisName = useCallback(
    (idJenis: number) => {
      const jenis = jenisBarang.find((j) => j.idJenis === idJenis)
      return jenis?.jenisBrg || "-"
    },
    [jenisBarang]
  )

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
    jenisParam,
    stokBarang,
    jenisBarang,
    loading,
    getJenisName,
    formatRupiah,
  }
}

