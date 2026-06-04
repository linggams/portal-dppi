"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLaporan } from "./hooks/useLaporan"
import {
  LaporanFiltersComponent,
  LaporanSummaryCards,
  LaporanTabCard,
} from "./components"
import { formatDate, formatRupiah, getStatusBadge } from "./utils"

export default function LaporanPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    data,
    summary,
    fetchData,
    handleExport,
  } = useLaporan()

  return (
    <DashboardLayout title="Laporan">
      <div className="space-y-6">
                <LaporanFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onFetch={fetchData}
        />

        {Object.keys(summary).length > 0 && (
          <LaporanSummaryCards summary={summary} />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="permintaan">Permintaan</TabsTrigger>
            <TabsTrigger value="pengajuan">Pengajuan</TabsTrigger>
            <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="stok">Stok</TabsTrigger>
          </TabsList>

          <TabsContent value="permintaan">
            <LaporanTabCard
              title="Laporan Permintaan Barang"
              loading={loading}
              hasData={data.length > 0}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: Record<string, unknown>) => (
                    <TableRow key={Number(item.idPermintaan)}>
                      <TableCell>
                        {formatDate(String(item.tglPermintaan ?? ""))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(item.unit)}
                      </TableCell>
                      <TableCell>
                        {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                      </TableCell>
                      <TableCell>{String(item.jumlah)}</TableCell>
                      <TableCell>
                        {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(Number(item.status ?? 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="pengajuan">
            <LaporanTabCard
              title="Laporan Pengajuan Barang"
              loading={loading}
              hasData={data.length > 0}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: Record<string, unknown>) => (
                    <TableRow key={Number(item.idPengajuan)}>
                      <TableCell>
                        {formatDate(String(item.tglPengajuan ?? ""))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(item.unit)}
                      </TableCell>
                      <TableCell>
                        {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                      </TableCell>
                      <TableCell>{String(item.jumlah)}</TableCell>
                      <TableCell>{String(item.satuan)}</TableCell>
                      <TableCell>
                        {formatRupiah(Number(item.hargabarang ?? 0))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatRupiah(Number(item.total ?? 0))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(Number(item.status ?? 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="pemasukan">
            <LaporanTabCard
              title="Laporan Pemasukan Barang"
              loading={loading}
              hasData={data.length > 0}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: Record<string, unknown>, index: number) => (
                    <TableRow key={`pemasukan-${index}`}>
                      <TableCell>
                        {formatDate(String(item.tglMasuk ?? ""))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(item.unit)}
                      </TableCell>
                      <TableCell>
                        {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                      </TableCell>
                      <TableCell>{String(item.jumlah)}</TableCell>
                      <TableCell>
                        {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="pengeluaran">
            <LaporanTabCard
              title="Laporan Pengeluaran Barang"
              loading={loading}
              hasData={data.length > 0}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: Record<string, unknown>, index: number) => (
                    <TableRow key={`pengeluaran-${index}`}>
                      <TableCell>
                        {formatDate(String(item.tglKeluar ?? ""))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(item.unit)}
                      </TableCell>
                      <TableCell>
                        {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                      </TableCell>
                      <TableCell>{String(item.jumlah)}</TableCell>
                      <TableCell>
                        {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LaporanTabCard>
          </TabsContent>

          <TabsContent value="stok">
            <LaporanTabCard
              title="Laporan Stok Barang"
              loading={loading}
              hasData={data.length > 0}
              onExport={handleExport}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Barang</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Keluar</TableHead>
                    <TableHead>Sisa</TableHead>
                    <TableHead>Satuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: Record<string, unknown>) => (
                    <TableRow key={Number(item.idKodeBrg)}>
                      <TableCell>{String(item.kodeBrg)}</TableCell>
                      <TableCell className="font-medium">
                        {String(item.namaBrg)}
                      </TableCell>
                      <TableCell>{String(item.stok)}</TableCell>
                      <TableCell>{String(item.keluar)}</TableCell>
                      <TableCell
                        className={
                          (item.sisa as number) <= 10
                            ? "text-destructive font-semibold"
                            : "font-medium"
                        }
                      >
                        {String(item.sisa)}
                      </TableCell>
                      <TableCell>{String(item.satuan)}</TableCell>
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
