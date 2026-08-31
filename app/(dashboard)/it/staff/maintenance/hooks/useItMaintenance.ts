"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"
import {
  DEFAULT_PAGE_SIZE,
  readPaginatedJson,
} from "@/lib/shared/pagination"
import type {
  KategoriAggItem,
  MaintenanceFilters,
  MaintenanceListItem,
  MaintenanceSummaryData,
  MaintenanceTab,
  TeknisiAggItem,
} from "../types"

export function useItMaintenance() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTabState] = useState<MaintenanceTab>("daftar")
  const [filters, setFiltersState] = useState<MaintenanceFilters>(() => ({
    ...getMonthToDateRangeWIB(),
    kategoriId: "all",
    username: "",
    sumber: "all",
    hasil: "all",
    q: "",
  }))
  const [listData, setListData] = useState<MaintenanceListItem[]>([])
  const [kategoriData, setKategoriData] = useState<KategoriAggItem[]>([])
  const [teknisiData, setTeknisiData] = useState<TeknisiAggItem[]>([])
  const [summary, setSummary] = useState<MaintenanceSummaryData | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const setActiveTab = useCallback((tab: MaintenanceTab) => {
    setPage(1)
    setActiveTabState(tab)
  }, [])

  const setFilters = useCallback((next: MaintenanceFilters) => {
    setPage(1)
    setFiltersState(next)
  }, [])

  const buildParams = useCallback(
    (tab: MaintenanceTab, currentPage: number) => {
      const params = new URLSearchParams({ tab })
      if (filters.startDate) params.append("start_date", filters.startDate)
      if (filters.endDate) params.append("end_date", filters.endDate)
      if (filters.kategoriId !== "all")
        params.append("kategori_id", filters.kategoriId)
      if (filters.username.trim())
        params.append("username", filters.username.trim())
      if (filters.sumber !== "all") params.append("sumber", filters.sumber)
      if (filters.hasil !== "all") params.append("hasil", filters.hasil)
      if (filters.q.trim()) params.append("q", filters.q.trim())
      params.set("page", String(currentPage))
      return params
    },
    [filters]
  )

  const fetchData = useCallback(
    async (pageOverride?: number) => {
      const currentPage = pageOverride ?? page
      setLoading(true)
      try {
        const params = buildParams(activeTab, currentPage)
        const response = await fetch(`/api/it/maintenance?${params.toString()}`)
        if (!response.ok) {
          toast.error("Gagal memuat data maintenance")
          return
        }
        const json = await response.json()
        setSummary(json.summary ?? null)

        if (activeTab === "daftar") {
          const result = readPaginatedJson<MaintenanceListItem>(json)
          setListData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        } else if (activeTab === "kategori") {
          const result = readPaginatedJson<KategoriAggItem>(json)
          setKategoriData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        } else {
          const result = readPaginatedJson<TeknisiAggItem>(json)
          setTeknisiData(result.data)
          setTotal(result.total)
          setTotalPages(result.totalPages)
          setPageSize(result.pageSize)
        }
      } catch {
        toast.error("Gagal memuat data maintenance")
      } finally {
        setLoading(false)
      }
    },
    [activeTab, buildParams, page]
  )

  const handleFetch = useCallback(() => {
    setPage(1)
    void fetchData(1)
  }, [fetchData])

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchData()
    }
  }, [filters.startDate, filters.endDate, activeTab, page, fetchData])

  return {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    listData,
    kategoriData,
    teknisiData,
    summary,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchData: handleFetch,
    hasData:
      activeTab === "daftar"
        ? listData.length > 0
        : activeTab === "kategori"
          ? kategoriData.length > 0
          : teknisiData.length > 0,
  }
}
