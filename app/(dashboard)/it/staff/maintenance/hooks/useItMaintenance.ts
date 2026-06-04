"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
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
  const [activeTab, setActiveTab] = useState<MaintenanceTab>("daftar")
  const [filters, setFilters] = useState<MaintenanceFilters>({
    startDate: "",
    endDate: "",
    kategoriId: "all",
    username: "",
    sumber: "all",
    hasil: "all",
    q: "",
  })
  const [listData, setListData] = useState<MaintenanceListItem[]>([])
  const [kategoriData, setKategoriData] = useState<KategoriAggItem[]>([])
  const [teknisiData, setTeknisiData] = useState<TeknisiAggItem[]>([])
  const [summary, setSummary] = useState<MaintenanceSummaryData | null>(null)

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    setFilters((prev) => ({
      ...prev,
      startDate: firstDay.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    }))
  }, [])

  const buildParams = useCallback(
    (tab: MaintenanceTab) => {
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
      return params
    },
    [filters]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildParams(activeTab)
      const response = await fetch(`/api/it/maintenance?${params.toString()}`)
      if (!response.ok) {
        toast.error("Gagal memuat data maintenance")
        return
      }
      const result = await response.json()
      setSummary(result.summary ?? null)

      if (activeTab === "daftar") {
        setListData(result.data ?? [])
      } else if (activeTab === "kategori") {
        setKategoriData(result.data ?? [])
      } else {
        setTeknisiData(result.data ?? [])
      }
    } catch {
      toast.error("Gagal memuat data maintenance")
    } finally {
      setLoading(false)
    }
  }, [activeTab, buildParams])

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchData()
    }
  }, [filters.startDate, filters.endDate, activeTab, fetchData])

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
    fetchData,
    hasData:
      activeTab === "daftar"
        ? listData.length > 0
        : activeTab === "kategori"
          ? kategoriData.length > 0
          : teknisiData.length > 0,
  }
}
