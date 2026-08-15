"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  CompactFilterCard,
  DashboardLayout,
  FILTER_CONTROL_CLASS,
  FilterField,
  FilterSummaryPanel,
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

export default function MobilAdminLaporanPage() {
  const [rows, setRows] = useState<MobilLaporanKm[]>([])
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [idKendaraan, setIdKendaraan] = useState("all")
  const [q, setQ] = useState("")

  useEffect(() => {
    const today = new Date()
    const first = new Date(today.getFullYear(), today.getMonth(), 1)
    setStartDate(first.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
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
    if (startDate || endDate) fetchRows()
  }, [fetchRows, startDate, endDate])

  const summary = useMemo(() => {
    const totalPemakaian = rows.reduce((sum, r) => sum + r.pemakaian, 0)
    const totalTrip = rows.reduce((sum, r) => sum + r.jumlahPerjalanan, 0)
    return { total: rows.length, totalPemakaian, totalTrip }
  }, [rows])

  const handleDelete = async (row: MobilLaporanKm) => {
    const nopol = row.kendaraan?.nopol ?? `#${row.idKendaraan}`
    if (
      !confirm(
        `Hapus laporan ${nopol} tanggal ${row.tanggal} (pemohon: ${row.username})?`
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

  return (
    <DashboardLayout title="Laporan Kilometer">
      <div className="space-y-4">
        <FilterSummaryPanel
          filterCols={7}
          filter={
            <CompactFilterCard
              footer={
                <Button size="sm" onClick={fetchRows}>
                  Tampilkan
                </Button>
              }
            >
              <FilterField>
                <DatePicker
                  className={FILTER_CONTROL_CLASS}
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Tanggal mulai"
                />
              </FilterField>
              <FilterField>
                <DatePicker
                  className={FILTER_CONTROL_CLASS}
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Tanggal akhir"
                />
              </FilterField>
              <FilterField>
                <Select value={idKendaraan} onValueChange={setIdKendaraan}>
                  <SelectTrigger className={FILTER_CONTROL_CLASS}>
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
              </FilterField>
              <FilterField>
                <Input
                  className={FILTER_CONTROL_CLASS}
                  placeholder="Cari pemohon / nopol"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </FilterField>
            </CompactFilterCard>
          }
          summary={
            <CompactSummaryGrid>
              <SummaryMetric label="Total laporan" value={summary.total} />
              <SummaryMetric
                label="Total perjalanan"
                value={summary.totalTrip}
              />
              <SummaryMetric
                label="Total KM pemakaian"
                value={summary.totalPemakaian.toLocaleString("id-ID")}
              />
            </CompactSummaryGrid>
          }
        />

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
                  <TableHead>Pemohon</TableHead>
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
