"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { DanaPengajuan, DanaPengajuanPayload } from "@/lib/dana/dana-types"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"

async function readError(response: Response, fallback: string) {
  try {
    const data = await response.json()
    if (typeof data.error === "string") return data.error
  } catch {
    /* ignore */
  }
  return fallback
}

export function usePengajuanDana(
  options: {
    mine?: boolean
    initialStatus?: string
  } = {}
) {
  const mine = options.mine ?? false
  const [rows, setRows] = useState<DanaPengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(
    options.initialStatus ?? "all"
  )
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, debouncedQuery])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (mine) params.set("mine", "true")
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (debouncedQuery) params.set("q", debouncedQuery)
      params.set("page", String(page))

      const response = await fetch(`/api/dana/pengajuan?${params.toString()}`)
      if (!response.ok) {
        throw new Error(await readError(response, "Gagal memuat pengajuan dana"))
      }
      const result = readPaginatedJson<DanaPengajuan>(await response.json())
      setRows(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setPageSize(result.pageSize)
    } catch (error) {
      setRows([])
      setTotal(0)
      setTotalPages(1)
      toast.error(
        error instanceof Error ? error.message : "Gagal memuat pengajuan dana"
      )
    } finally {
      setLoading(false)
    }
  }, [mine, statusFilter, debouncedQuery, page])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const createPengajuan = async (payload: DanaPengajuanPayload) => {
    const response = await fetch("/api/dana/pengajuan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      toast.error(await readError(response, "Gagal mengajukan dana"))
      return false
    }
    toast.success("Pengajuan dana terkirim")
    await fetchRows()
    return true
  }

  const revisePengajuan = async (
    id: number,
    payload: DanaPengajuanPayload
  ) => {
    const response = await fetch(`/api/dana/pengajuan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      toast.error(await readError(response, "Gagal menyimpan revisi"))
      return false
    }
    toast.success("Revisi pengajuan disimpan")
    await fetchRows()
    return true
  }

  const cancelPengajuan = async (id: number) => {
    const response = await fetch(`/api/dana/pengajuan/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    })
    if (!response.ok) {
      toast.error(await readError(response, "Gagal membatalkan pengajuan"))
      return false
    }
    toast.success("Pengajuan dibatalkan")
    await fetchRows()
    return true
  }

  const saveKembalian = async (id: number, kembalian: number) => {
    const response = await fetch(`/api/dana/pengajuan/${id}/kembalian`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kembalian }),
    })
    if (!response.ok) {
      toast.error(await readError(response, "Gagal menyimpan kembalian"))
      return false
    }
    toast.success("Kembalian disimpan")
    await fetchRows()
    return true
  }

  return {
    rows,
    loading,
    statusFilter,
    setStatusFilter,
    query,
    setQuery,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    createPengajuan,
    revisePengajuan,
    cancelPengajuan,
    saveKembalian,
  }
}
