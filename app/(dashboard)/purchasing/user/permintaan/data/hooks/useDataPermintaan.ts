"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Permintaan } from "../types"

export function useDataPermintaan() {
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPermintaan = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/purchasing/permintaan")
      if (response.ok) {
        const data = await response.json()
        setPermintaan(data)
      }
    } catch {
      toast.error("Gagal memuat data permintaan")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermintaan()
  }, [fetchPermintaan])

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch {
      return dateString
    }
  }, [])

  const groupedPermintaan = permintaan.reduce((acc, item) => {
    const date = item.tglPermintaan.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, Permintaan[]>)

  return { permintaan, loading, groupedPermintaan, formatDate }
}
