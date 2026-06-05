"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { getDefaultPermintaanGroupDateRange } from "@/lib/purchasing/permintaan-group-types"
import type {
  PermintaanGroupFilters,
  PermintaanGroupRow,
  PermintaanGroupsSummary,
} from "../types"

const emptySummary: PermintaanGroupsSummary = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
}

export function usePermintaanGroups() {
  const [filters, setFilters] = useState<PermintaanGroupFilters>(() => {
    const { startDate, endDate } = getDefaultPermintaanGroupDateRange()
    return {
      startDate,
      endDate,
      status: "all",
      unit: "",
    }
  })
  const [appliedFilters, setAppliedFilters] =
    useState<PermintaanGroupFilters>(filters)
  const [page, setPage] = useState(1)
  const [groups, setGroups] = useState<PermintaanGroupRow[]>([])
  const [summary, setSummary] = useState<PermintaanGroupsSummary>(emptySummary)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        start_date: appliedFilters.startDate,
        end_date: appliedFilters.endDate,
        page: String(page),
      })
      if (appliedFilters.status !== "all") {
        params.append("status", appliedFilters.status)
      }
      if (appliedFilters.unit.trim()) {
        params.append("unit", appliedFilters.unit.trim())
      }

      const response = await fetch(
        `/api/purchasing/permintaan/groups?${params.toString()}`
      )
      if (!response.ok) {
        toast.error("Gagal memuat data permintaan")
        return
      }

      const result = await response.json()
      setGroups(result.data ?? [])
      setSummary(result.summary ?? emptySummary)
      setTotal(result.total ?? 0)
      setTotalPages(result.totalPages ?? 1)
      setPageSize(result.pageSize ?? 20)
    } catch {
      toast.error("Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, page])

  useEffect(() => {
    if (appliedFilters.startDate && appliedFilters.endDate) {
      fetchGroups()
    }
  }, [fetchGroups, appliedFilters.startDate, appliedFilters.endDate])

  const handleApplyFilters = useCallback(() => {
    setPage(1)
    setAppliedFilters(filters)
  }, [filters])

  const handleResetFilters = useCallback(() => {
    const { startDate, endDate } = getDefaultPermintaanGroupDateRange()
    const next = {
      startDate,
      endDate,
      status: "all",
      unit: "",
    }
    setFilters(next)
    setAppliedFilters(next)
    setPage(1)
  }, [])

  return {
    filters,
    setFilters,
    page,
    setPage,
    groups,
    summary,
    total,
    totalPages,
    pageSize,
    loading,
    handleApplyFilters,
    handleResetFilters,
    refetch: fetchGroups,
  }
}
