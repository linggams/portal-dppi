"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
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
import { useItLaporan } from "./hooks/useItLaporan"
import { ItLaporanFilters, ItLaporanSummaryCards } from "./components"
import {
  formatJamAtauHari,
  formatTiketDate,
  getPrioritasBadge,
  getStatusBadge,
} from "./utils"

interface KategoriOption {
  idKategori: number
  nama: string
}

export default function ItLaporanPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    tiketData,
    kategoriData,
    teknisiData,
    summary,
    fetchData,
    handleExport,
    hasData,
  } = useItLaporan()

  const [kategori, setKategori] = useState<KategoriOption[]>([])

  useEffect(() => {
    fetch("/api/it/kategori")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKategori(data) : setKategori([])))
      .catch(() => setKategori([]))
  }, [])

  return (
    <DashboardLayout title="Laporan Tiket IT">
      <div className="space-y-6">
        <ItLaporanFilters
          filters={filters}
          kategori={kategori}
          onFiltersChange={setFilters}
          onFetch={fetchData}
        />

        <ItLaporanSummaryCards summary={summary} />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tiket">Daftar Tiket</TabsTrigger>
            <TabsTrigger value="kategori">Per Kategori</TabsTrigger>
            <TabsTrigger value="teknisi">Per Teknisi</TabsTrigger>
          </TabsList>

          <TabsContent value="tiket">
            <LaporanTabCard
              title="Laporan Daftar Tiket"
              loading={loading}
              hasData={hasData}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Tiket</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Pemohon</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teknisi</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead>Selesai</TableHead>
                    <TableHead className="w-[72px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiketData.map((t) => (
                    <TableRow key={t.idTiket}>
                      <TableCell className="font-mono text-sm">
                        {t.nomorTiket}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {t.judul}
                      </TableCell>
                      <TableCell>{t.username}</TableCell>
                      <TableCell>{t.kategori.nama}</TableCell>
                      <TableCell>{getPrioritasBadge(t.prioritas)}</TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell>{t.ditugaskanKe ?? "-"}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatTiketDate(t.tglDibuat)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {t.tglSelesai
                          ? formatTiketDate(t.tglSelesai)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <TableActionLink
                          href={`/it/staff/tiket/${t.idTiket}`}
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

          <TabsContent value="kategori">
            <LaporanTabCard
              title="Laporan per Kategori"
              loading={loading}
              hasData={hasData}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Dalam antrian</TableHead>
                    <TableHead>Selesai</TableHead>
                    <TableHead>Rata-rata selesai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kategoriData.map((k) => (
                    <TableRow key={k.idKategori}>
                      <TableCell className="font-medium">
                        {k.kategoriNama}
                      </TableCell>
                      <TableCell>{k.total}</TableCell>
                      <TableCell>{k.dalamAntrian}</TableCell>
                      <TableCell>{k.selesai}</TableCell>
                      <TableCell>
                        {formatJamAtauHari(k.rataRataJamSelesai)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="teknisi">
            <LaporanTabCard
              title="Laporan per Teknisi"
              loading={loading}
              hasData={hasData}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teknisi</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Dalam antrian</TableHead>
                    <TableHead>Selesai</TableHead>
                    <TableHead>Rata-rata selesai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teknisiData.map((t) => (
                    <TableRow key={t.ditugaskanKe}>
                      <TableCell className="font-medium">
                        {t.ditugaskanKe}
                      </TableCell>
                      <TableCell>{t.total}</TableCell>
                      <TableCell>{t.dalamAntrian}</TableCell>
                      <TableCell>{t.selesai}</TableCell>
                      <TableCell>
                        {formatJamAtauHari(t.rataRataJamSelesai)}
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
