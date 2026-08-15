"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DashboardLayout,
  PageActions,
  SummaryMetric,
  CompactSummaryGrid,
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
import type { MobilKendaraan, MobilLaporanKm } from "@/lib/mobil/mobil-types"
import { downloadMobilLaporanListExcel } from "@/lib/mobil/export-laporan"
import { getMonthToDateRangeWIB } from "@/lib/purchasing/permintaan-daily-limit-types"

export default function MobilAdminLaporanPage() {
  const defaultRange = useMemo(() => getMonthToDateRangeWIB(), [])
  const [rows, setRows] = useState<MobilLaporanKm[]>([])
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [idKendaraan, setIdKendaraan] = useState("all")
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/mobil/kendaraan")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKendaraan(data) : setKendaraan([])))
      .catch(() => setKendaraan([]))
  }, [])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set("start_date", startDate)
      if (endDate) params.set("end_date", endDate)
      if (idKendaraan !== "all") params.set("id_kendaraan", idKendaraan)
      if (q.trim()) params.set("q", q.trim())
      const res = await fetch(`/api/mobil/laporan?${params.toString()}`)
      if (!res.ok) throw new Error("Gagal memuat laporan")
      setRows(await res.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, idKendaraan, q])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const summary = useMemo(() => {
    const totalPemakaian = rows.reduce((sum, r) => sum + r.pemakaian, 0)
    const totalTrip = rows.reduce((sum, r) => sum + r.jumlahPerjalanan, 0)
    return { total: rows.length, totalPemakaian, totalTrip }
  }, [rows])

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
    if (rows.length === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }
    try {
      await downloadMobilLaporanListExcel(rows, { startDate, endDate })
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
          <Button type="button" variant="outline" onClick={fetchRows}>
            Tampilkan
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={loading || rows.length === 0}
          onClick={handleExport}
        >
          Export
        </Button>
        <Button asChild>
          <Link href={baruHref}>Input Laporan</Link>
        </Button>
      </PageActions>

      <div className="space-y-4">
        <CompactSummaryGrid>
          <SummaryMetric label="Total laporan" value={summary.total} />
          <SummaryMetric label="Total perjalanan" value={summary.totalTrip} />
          <SummaryMetric
            label="Total KM pemakaian"
            value={summary.totalPemakaian.toLocaleString("id-ID")}
          />
        </CompactSummaryGrid>

        {loading ? (
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
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
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableEmptyState colSpan={8} title="Tidak ada laporan" />
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
        )}
      </div>
    </DashboardLayout>
  )
}
