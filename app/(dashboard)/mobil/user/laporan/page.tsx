"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import type { MobilKendaraan, MobilLaporanKm } from "@/lib/mobil/mobil-types"
import { formatRupiah } from "@/lib/dana/format"

export default function MobilUserLaporanPage() {
  const [rows, setRows] = useState<MobilLaporanKm[]>([])
  const [kendaraan, setKendaraan] = useState<MobilKendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [filterKendaraan, setFilterKendaraan] = useState("all")

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterKendaraan !== "all") {
        params.set("id_kendaraan", filterKendaraan)
      }
      const res = await fetch(`/api/mobil/laporan?${params.toString()}`)
      if (!res.ok) throw new Error("Gagal memuat laporan")
      setRows(await res.json())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [filterKendaraan])

  useEffect(() => {
    fetch("/api/mobil/kendaraan?aktif=true")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKendaraan(data) : setKendaraan([])))
      .catch(() => setKendaraan([]))
  }, [])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const balanceSummary = useMemo(() => {
    if (filterKendaraan === "all") return null
    const selected = kendaraan.find(
      (k) => String(k.idKendaraan) === filterKendaraan
    )
    const latest = rows[0]
    return {
      nopol: selected?.nopol ?? "—",
      kmTerakhir: latest?.kmAkhir ?? selected?.kmTerakhir ?? selected?.kmAwal ?? 0,
      pemakaianDaftar: rows.reduce((s, r) => s + r.pemakaian, 0),
      totalUangJalan: rows.reduce((s, r) => s + r.uangJalan, 0),
      totalBiayaPerjalanan: rows.reduce((s, r) => s + r.totalTol, 0),
      totalBalance: rows.reduce((s, r) => s + r.balanceUangJalan, 0),
    }
  }, [filterKendaraan, kendaraan, rows])

  const baruHref =
    filterKendaraan !== "all"
      ? `/mobil/user/laporan/baru?kendaraan=${filterKendaraan}`
      : "/mobil/user/laporan/baru"

  return (
    <DashboardLayout title="Input Laporan">
      <PageActions>
        <div className="mr-auto">
          <Select value={filterKendaraan} onValueChange={setFilterKendaraan}>
            <SelectTrigger className="w-[200px]">
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
        </div>
        <Button asChild>
          <Link href={baruHref}>Input Laporan</Link>
        </Button>
      </PageActions>

      {balanceSummary ? (
        <div className="rounded-md border px-4 py-3 text-sm">
          <span className="font-medium">{balanceSummary.nopol}</span>
          {" · "}
          KM terakhir{" "}
          <span className="font-medium">
            {balanceSummary.kmTerakhir.toLocaleString("id-ID")} KM
          </span>
          {" · "}
          Pemakaian daftar ini{" "}
          <span className="font-medium">
            {balanceSummary.pemakaianDaftar.toLocaleString("id-ID")} KM
          </span>
          {" · "}
          Uang jalan{" "}
          <span className="font-medium">
            {formatRupiah(balanceSummary.totalUangJalan)}
          </span>
          {" · "}
          Biaya perjalanan{" "}
          <span className="font-medium">
            {formatRupiah(balanceSummary.totalBiayaPerjalanan)}
          </span>
          {" · "}
          Balance{" "}
          <span className="font-medium">
            {formatRupiah(balanceSummary.totalBalance)}
          </span>
        </div>
      ) : null}

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
                <TableHead className="text-right">Uang jalan</TableHead>
                <TableHead className="text-right">Biaya perjalanan</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmptyState colSpan={11} title="Belum ada laporan KM" />
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
                          href={`/mobil/user/laporan/${row.idLaporan}`}
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
    </DashboardLayout>
  )
}
