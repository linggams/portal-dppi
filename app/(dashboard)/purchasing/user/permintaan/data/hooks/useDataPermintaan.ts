"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { DEFAULT_PAGE_SIZE, paginateArray } from "@/lib/shared/pagination"
import type { Permintaan } from "../types"

export function useDataPermintaan() {
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchPermintaan = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/purchasing/permintaan")
      if (response.ok) {
        const data = await response.json()
        setPermintaan(Array.isArray(data) ? data : [])
        setPage(1)
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

  const dateGroups = useMemo(() => {
    const grouped = permintaan.reduce(
      (acc, item) => {
        const date = item.tglPermintaan.split("T")[0]
        if (!acc[date]) acc[date] = []
        acc[date].push(item)
        return acc
      },
      {} as Record<string, Permintaan[]>
    )
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
  }, [permintaan])

  const paginatedGroups = useMemo(
    () => paginateArray(dateGroups, page, DEFAULT_PAGE_SIZE),
    [dateGroups, page]
  )

  const groupedPermintaan = useMemo(
    () => Object.fromEntries(paginatedGroups.data),
    [paginatedGroups.data]
  )

  return {
    permintaan,
    loading,
    groupedPermintaan,
    formatDate,
    page,
    setPage,
    total: paginatedGroups.total,
    totalPages: paginatedGroups.totalPages,
    pageSize: paginatedGroups.pageSize,
  }
}
