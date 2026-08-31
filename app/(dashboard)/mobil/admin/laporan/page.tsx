"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DashboardLayout,
  PageActions,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import {
  TableActionButton,
  TableActionLink,
  TableActions,
} from "@/components/ui/table-actions"
import { TablePagination } from "@/components/ui/table-pagination"
import type { MobilKendaraan, MobilLaporanKm } from "@/lib/mobil/mobil-types"
import { downloadMobilLaporanListExcel } from "@/lib/mobil/export-laporan"
import { formatRupiah } from "@/lib/dana/format"
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"

type LaporanSummary = {
  total: number
  totalPemakaian: number
  totalTrip: number
  totalUangJalan: number
  totalBiayaPerjalanan: number
  totalBalance: number
}

const EMPTY_SUMMARY: LaporanSummary = {
  total: 0,
  totalPemakaian: 0,
  totalTrip: 0,
  totalUangJalan: 0,
  totalBiayaPerjalanan: 0,
  totalBalance: 0,
}

function parseSummary(json: unknown): LaporanSummary {
  if (!json || typeof json !== "object") return EMPTY_SUMMARY
  const s = (json as { summary?: Partial<LaporanSummary> }).summary
  if (!s || typeof s !== "object") return EMPTY_SUMMARY
  return {
    total: typeof s.total === "number" ? s.total : 0,
    totalPemakaian: typeof s.totalPemakaian === "number" ? s.totalPemakaian : 0,
    totalTrip: typeof s.totalTrip === "number" ? s.totalTrip : 0,
    totalUangJalan: typeof s.totalUangJalan === "number" ? s.totalUangJalan : 0,
    totalBiayaPerjalanan:
      typeof s.totalBiayaPerjalanan === "number" ? s.totalBiayaPerjalanan : 0,
    totalBalance: typeof s.totalBalance === "number" ? s.totalBalance : 0,
  }
}

function buildLaporanParams(opts: {
  startDate: string
  endDate: string
  idKendaraan: string
  q: string
  page: number
  pageSize?: number
}) {
  const params = new URLSearchParams()
  if (opts.startDate) params.set("start_date", opts.startDate)
  if (opts.endDate) params.set("end_date", opts.endDate)
  if (opts.idKendaraan !== "all") params.set("id_kendaraan", opts.idKendaraan)
  if (opts.q.trim()) params.set("q", opts.q.trim())
  params.set("page", String(opts.page))
  if (opts.pageSize) params.set("page_size", String(opts.pageSize))
  return params
}

export default function MobilAdminLaporanPage() {
  const defaultRange = useMemo(() => getMonthToDateRangeWIB(), [])
  const [rows, setRows] = useState<MobilLaporanKm[]>([])
  const [summary, setSummary] = useState<LaporanSummary>(EMPTY_SUMMARY)
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [idKendaraan, setIdKendaraan] = useState("all")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    fetch("/api/mobil/kendaraan")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKendaraan(data) : setKendaraan([])))
      .catch(() => setKendaraan([]))
  }, [])

  const fetchRows = useCallback(
    async (pageOverride?: number) => {
      const currentPage = pageOverride ?? page
      setLoading(true)
      try {
        const params = buildLaporanParams({
          startDate,
          endDate,
          idKendaraan,
          q,
          page: currentPage,
        })
        const res = await fetch(`/api/mobil/laporan?${params.toString()}`)
        if (!res.ok) throw new Error("Gagal memuat laporan")
        const json = await res.json()
        const result = readPaginatedJson<MobilLaporanKm>(json)
        setRows(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
        setSummary(parseSummary(json))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat")
        setRows([])
        setTotal(0)
        setTotalPages(1)
        setSummary(EMPTY_SUMMARY)
      } finally {
        setLoading(false)
      }
    },
    [startDate, endDate, idKendaraan, q, page]
  )

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const handleTampilkan = () => {
    setPage(1)
    void fetchRows(1)
  }

  const handleDelete = async (row: MobilLaporanKm) => {
    const nopol = row.kendaraan?.nopol ?? `#${row.idKendaraan}`
    if (
      !confirm(
        `Hapus laporan ${nopol} tanggal ${row.tanggal} (pelapor: ${row.username})?`
      )
    ) {
      return
    }
    const res = await fetch(`/api/mobil/laporan/${row.idLaporan}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(typeof data.error === "string" ? data.error : "Gagal menghapus")
      return
    }
    toast.success("Laporan dihapus")
    await fetchRows()
  }

  const baruHref =
    idKendaraan !== "all"
      ? `/mobil/admin/laporan/baru?kendaraan=${idKendaraan}`
      : "/mobil/admin/laporan/baru"

  const handleExport = async () => {
    if (total === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }
    try {
      const allRows: MobilLaporanKm[] = []
      let exportPage = 1
      let exportTotalPages = 1
      do {
        const params = buildLaporanParams({
          startDate,
          endDate,
          idKendaraan,
          q,
          page: exportPage,
          pageSize: MAX_PAGE_SIZE,
        })
        const res = await fetch(`/api/mobil/laporan?${params.toString()}`)
        if (!res.ok) throw new Error("Gagal memuat data ekspor")
        const result = readPaginatedJson<MobilLaporanKm>(await res.json())
        allRows.push(...result.data)
        exportTotalPages = result.totalPages
        exportPage += 1
      } while (exportPage <= exportTotalPages)

      if (allRows.length === 0) {
        toast.error("Tidak ada data untuk diekspor")
        return
      }
      await downloadMobilLaporanListExcel(allRows, { startDate, endDate })
      toast.success("Excel diunduh")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengekspor")
    }
  }

  return (
    <DashboardLayout title="Laporan Kilometer">
      <PageActions>
        <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
          <DatePicker
            className="w-[160px]"
            value={startDate}
            onChange={setStartDate}
            placeholder="Tanggal mulai"
          />
          <DatePicker
            className="w-[160px]"
            value={endDate}
            onChange={setEndDate}
            placeholder="Tanggal akhir"
          />
          <Select value={idKendaraan} onValueChange={setIdKendaraan}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Kendaraan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kendaraan</SelectItem>
              {kendaraan.map((k) => (
                <SelectItem key={k.idKendaraan} value={String(k.idKendaraan)}>
                  {k.nopol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="w-[180px]"
            placeholder="Cari pelapor / nopol"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleTampilkan}>
            Tampilkan
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading || total === 0}
          onClick={handleExport}
        >
          Export
        </Button>
        <Button asChild>
          <Link href={baruHref}>Input Laporan</Link>
        </Button>
      </PageActions>

      <div className="space-y-4">
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Total laporan</TableHead>
                <TableHead>Total perjalanan</TableHead>
                <TableHead className="text-right">Total KM pemakaian</TableHead>
                <TableHead className="text-right">Total uang jalan</TableHead>
                <TableHead className="text-right">Total biaya perjalanan</TableHead>
                <TableHead className="text-right">Total balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="tabular-nums">{summary.total}</TableCell>
                <TableCell className="tabular-nums">{summary.totalTrip}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {summary.totalPemakaian.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(summary.totalUangJalan)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(summary.totalBiayaPerjalanan)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(summary.totalBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {loading ? (
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nopol</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead className="text-right">KM awal</TableHead>
                    <TableHead className="text-right">KM akhir</TableHead>
                    <TableHead className="text-right">Pemakaian</TableHead>
                    <TableHead className="text-right">Trip</TableHead>
                    <TableHead className="text-right">Uang jalan</TableHead>
                    <TableHead className="text-right">Biaya perjalanan</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableEmptyState colSpan={11} title="Tidak ada laporan" />
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.idLaporan}>
                        <TableCell>{row.tanggal}</TableCell>
                        <TableCell className="font-medium">
                          {row.kendaraan?.nopol ?? "—"}
                        </TableCell>
                        <TableCell>{row.username}</TableCell>
                        <TableCell className="text-right">
                          {row.kmAwal.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.kmAkhir.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.pemakaian.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.jumlahPerjalanan}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(row.uangJalan)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(row.totalTol)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(row.balanceUangJalan)}
                        </TableCell>
                        <TableCell className="text-right">
                          <TableActions>
                            <TableActionLink
                              label="Detail"
                              icon={Eye}
                              href={`/mobil/admin/laporan/${row.idLaporan}`}
                            />
                            <TableActionButton
                              label="Hapus"
                              icon={Trash2}
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(row)}
                            />
                          </TableActions>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="laporan"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
