"use client"

import { Eye } from "lucide-react"
import {
  DashboardLayout,
  FilterSummaryPanel,
} from "@/components/layout"
import { LaporanTabCard } from "@/app/(dashboard)/purchasing/admin/laporan/components/LaporanTabCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableActionLink } from "@/components/ui/table-actions"
import { formatDanaDateOnly, formatRupiah } from "@/lib/dana/format"
import { getDanaStatusBadge } from "@/lib/dana/status"
import { DanaLaporanFilters, DanaLaporanSummaryCards } from "./components"
import { useDanaLaporan } from "./hooks/useDanaLaporan"
import type { DanaLaporanTab } from "./types"

export default function DanaLaporanPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
    daftarData,
    jabatanData,
    summary,
    fetchData,
    handleExport,
    hasData,
  } = useDanaLaporan()

  return (
    <DashboardLayout title="Laporan Pengajuan Dana">
      <div className="space-y-4">
        <FilterSummaryPanel
          filterCols={7}
          filter={
            <DanaLaporanFilters
              filters={filters}
              onFiltersChange={setFilters}
              onFetch={fetchData}
              onReset={resetFilters}
            />
          }
          summary={<DanaLaporanSummaryCards summary={summary} />}
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as DanaLaporanTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="daftar">Daftar</TabsTrigger>
            <TabsTrigger value="jabatan">Per Jabatan</TabsTrigger>
          </TabsList>

          <TabsContent value="daftar">
            <LaporanTabCard
              title="Laporan Daftar Pengajuan"
              loading={loading}
              hasData={hasData}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="text-right">Nominal</TableHead>
                    <TableHead className="text-right">Terpakai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Keperluan</TableHead>
                    <TableHead className="w-[72px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daftarData.map((row) => (
                    <TableRow key={row.idPengajuan}>
                      <TableCell className="font-medium">{row.nomor}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDanaDateOnly(row.tglDibuat)}
                      </TableCell>
                      <TableCell>{row.username}</TableCell>
                      <TableCell>{row.jabatan}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatRupiah(row.nominal)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatRupiah(row.terpakai)}
                      </TableCell>
                      <TableCell>{getDanaStatusBadge(row.status)}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {row.keperluan}
                      </TableCell>
                      <TableCell>
                        <TableActionLink
                          href={`/dana/admin/antrian/${row.idPengajuan}`}
                          label="Detail"
                          icon={Eye}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="jabatan">
            <LaporanTabCard
              title="Laporan per Jabatan"
              loading={loading}
              hasData={hasData}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jabatan</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Disetujui</TableHead>
                    <TableHead className="text-right">Ditolak</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Nominal disetujui</TableHead>
                    <TableHead className="text-right">Dana terpakai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jabatanData.map((row) => (
                    <TableRow key={row.jabatan}>
                      <TableCell className="font-medium">{row.jabatan}</TableCell>
                      <TableCell className="text-right">{row.total}</TableCell>
                      <TableCell className="text-right">{row.approved}</TableCell>
                      <TableCell className="text-right">{row.rejected}</TableCell>
                      <TableCell className="text-right">{row.pending}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatRupiah(row.nominalDisetujui)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatRupiah(row.danaTerpakai)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
