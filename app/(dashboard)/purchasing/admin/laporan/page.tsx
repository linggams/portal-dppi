"use client"

import {
  DashboardLayout,
  PageActions,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TablePagination } from "@/components/ui/table-pagination"
import { groupLaporan } from "@/lib/purchasing/laporan-group"
import { useLaporan } from "./hooks/useLaporan"
import {
  LaporanFiltersComponent,
  LaporanKategoriTables,
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
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchData,
    handleExport,
  } = useLaporan()

  return (
    <DashboardLayout title="Laporan">
      <PageActions>
        <LaporanFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onFetch={fetchData}
        />
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={loading || data.length === 0}
        >
          Export
        </Button>
      </PageActions>

      <div className="space-y-4">
        {Object.keys(summary).length > 0 ? (
          <LaporanSummaryCards summary={summary} />
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="permintaan">Permintaan</TabsTrigger>
            <TabsTrigger value="pengajuan">Pengajuan</TabsTrigger>
            <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
            <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            <TabsTrigger value="stok">Stok</TabsTrigger>
          </TabsList>

          <TabsContent value="permintaan">
            <div className="space-y-4">
              <LaporanTabCard
                title="Laporan Permintaan Barang"
                loading={loading}
                hasData={data.length > 0}
              >
              <LaporanKategoriTables
                tab="permintaan"
                groups={groupLaporan(data, "permintaan")}
                columns={[
                  "Tanggal",
                  "Unit",
                  "Nama Barang",
                  "Jumlah",
                  "Satuan",
                  "Status",
                ]}
                renderRow={(item) => (
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
                )}
                renderSubtotal={(group) => (
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="font-medium">{group.jumlah}</TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                )}
              />
              </LaporanTabCard>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>

          <TabsContent value="pengajuan">
            <div className="space-y-4">
              <LaporanTabCard
                title="Laporan Pengajuan Barang"
                loading={loading}
                hasData={data.length > 0}
              >
              <LaporanKategoriTables
                tab="pengajuan"
                groups={groupLaporan(data, "pengajuan")}
                columns={[
                  "Tanggal",
                  "Unit",
                  "Nama Barang",
                  "Jumlah",
                  "Satuan",
                  "Harga",
                  "Total",
                  "Status",
                ]}
                renderRow={(item) => (
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
                )}
                renderSubtotal={(group) => (
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="font-medium">{group.jumlah}</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell className="font-medium">
                      {formatRupiah(group.total)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              />
              </LaporanTabCard>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>

          <TabsContent value="pemasukan">
            <div className="space-y-4">
              <LaporanTabCard
                title="Laporan Pemasukan Barang"
                loading={loading}
                hasData={data.length > 0}
              >
              <LaporanKategoriTables
                tab="pemasukan"
                groups={groupLaporan(data, "pemasukan")}
                columns={["Tanggal", "Unit", "Nama Barang", "Jumlah", "Satuan"]}
                renderRow={(item) => (
                  <TableRow key={`pemasukan-${String(item.id)}`}>
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
                )}
                renderSubtotal={(group) => (
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="font-medium">{group.jumlah}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              />
              </LaporanTabCard>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>

          <TabsContent value="pengeluaran">
            <div className="space-y-4">
              <LaporanTabCard
                title="Laporan Pengeluaran Barang"
                loading={loading}
                hasData={data.length > 0}
              >
              <LaporanKategoriTables
                tab="pengeluaran"
                groups={groupLaporan(data, "pengeluaran")}
                columns={["Tanggal", "Unit", "Nama Barang", "Jumlah", "Satuan"]}
                renderRow={(item) => (
                  <TableRow key={`pengeluaran-${String(item.id)}`}>
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
                )}
                renderSubtotal={(group) => (
                  <TableRow>
                    <TableCell colSpan={3} className="font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="font-medium">{group.jumlah}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              />
              </LaporanTabCard>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>

          <TabsContent value="stok">
            <div className="space-y-4">
              <LaporanTabCard
                title="Laporan Stok Barang"
                loading={loading}
                hasData={data.length > 0}
              >
              <LaporanKategoriTables
                tab="stok"
                groups={groupLaporan(data, "stok")}
                columns={[
                  "Kode Barang",
                  "Nama Barang",
                  "Stok",
                  "Keluar",
                  "Sisa",
                  "Satuan",
                ]}
                renderRow={(item) => (
                  <TableRow key={Number(item.idKodeBrg)}>
                    <TableCell>{String(item.kodeBrg)}</TableCell>
                    <TableCell className="font-medium">
                      {String(item.namaBrg)}
                    </TableCell>
                    <TableCell>{String(item.stok)}</TableCell>
                    <TableCell>{String(item.keluar)}</TableCell>
                    <TableCell
                      className={
                        Number(item.sisa) <= 10
                          ? "font-semibold text-destructive"
                          : "font-medium"
                      }
                    >
                      {String(item.sisa)}
                    </TableCell>
                    <TableCell>{String(item.satuan)}</TableCell>
                  </TableRow>
                )}
                renderSubtotal={(group) => (
                  <TableRow>
                    <TableCell colSpan={2} className="font-medium">
                      Subtotal
                    </TableCell>
                    <TableCell className="font-medium">{group.stok}</TableCell>
                    <TableCell className="font-medium">{group.keluar}</TableCell>
                    <TableCell className="font-medium">{group.sisa}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              />
              </LaporanTabCard>
              <TablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
