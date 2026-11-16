"use client"

import {
  DashboardLayout,
  PageActions,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TablePagination } from "@/components/ui/table-pagination"
import {
  buildLaporanSections,
  formatMonthLabel,
  unitLabel,
  type LaporanLeafGroup,
  type LaporanSection,
} from "@/lib/purchasing/laporan-group"
import { useLaporan } from "./hooks/useLaporan"
import {
  LaporanFiltersComponent,
  LaporanGroupedTables,
  LaporanSummaryCards,
  LaporanTabCard,
  SubtotalRow,
} from "./components"
import { formatRupiah, getStatusBadge } from "./utils"

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

  const sections = buildLaporanSections(data, activeTab)

  const grand = sections.reduce(
    (sum, s) => ({
      jumlah: sum.jumlah + s.jumlah,
      total: sum.total + s.total,
      stok: sum.stok + s.stok,
      keluar: sum.keluar + s.keluar,
      sisa: sum.sisa + s.sisa,
    }),
    { jumlah: 0, total: 0, stok: 0, keluar: 0, sisa: 0 }
  )

  return (
    <DashboardLayout title="Laporan">
      <PageActions>
        <LaporanFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onFetch={fetchData}
          mode={activeTab === "stok" ? "stok" : "transaksi"}
          showStatus={
            activeTab === "permintaan" || activeTab === "pengajuan"
          }
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
            <TransaksiTab
              title="Laporan Permintaan Barang"
              loading={loading}
              hasData={data.length > 0}
              tab="permintaan"
              sections={sections}
              columns={["Nama Barang", "Jumlah", "Satuan", "User", "Status"]}
              formatSectionTitle={formatMonthLabel}
              renderRow={(item) => (
                <>
                  <TableCell>
                    {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                  </TableCell>
                  <TableCell>{String(item.jumlah)}</TableCell>
                  <TableCell>
                    {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                  </TableCell>
                  <TableCell>{unitLabel(item)}</TableCell>
                  <TableCell>
                    {getStatusBadge(Number(item.status ?? 0))}
                  </TableCell>
                </>
              )}
              renderLeafSubtotal={(group) => (
                <SubtotalRow label={`Subtotal ${group.label}`} colSpanLabel={1}>
                  <TableCell className="font-medium">{group.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderSectionSubtotal={(section) => (
                <SubtotalRow
                  label={`Subtotal ${formatMonthLabel(section.title)}`}
                  colSpanLabel={1}
                  tone="section"
                >
                  <TableCell className="font-medium">{section.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderGrandTotal={() => (
                <SubtotalRow
                  label="Total keseluruhan"
                  colSpanLabel={1}
                  tone="grand"
                >
                  <TableCell className="font-medium">{grand.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="pengajuan">
            <TransaksiTab
              title="Laporan Pengajuan Barang"
              loading={loading}
              hasData={data.length > 0}
              tab="pengajuan"
              sections={sections}
              columns={[
                "Nama Barang",
                "Jumlah",
                "Satuan",
                "Harga",
                "Total",
                "User",
                "Status",
              ]}
              formatSectionTitle={formatMonthLabel}
              renderRow={(item) => (
                <>
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
                  <TableCell>{unitLabel(item)}</TableCell>
                  <TableCell>
                    {getStatusBadge(Number(item.status ?? 0))}
                  </TableCell>
                </>
              )}
              renderLeafSubtotal={(group) => (
                <SubtotalRow label={`Subtotal ${group.label}`} colSpanLabel={1}>
                  <TableCell className="font-medium">{group.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-medium">
                    {formatRupiah(group.total)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderSectionSubtotal={(section) => (
                <SubtotalRow
                  label={`Subtotal ${formatMonthLabel(section.title)}`}
                  colSpanLabel={1}
                  tone="section"
                >
                  <TableCell className="font-medium">{section.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-medium">
                    {formatRupiah(section.total)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderGrandTotal={() => (
                <SubtotalRow
                  label="Total keseluruhan"
                  colSpanLabel={1}
                  tone="grand"
                >
                  <TableCell className="font-medium">{grand.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell className="font-medium">
                    {formatRupiah(grand.total)}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="pemasukan">
            <TransaksiTab
              title="Laporan Pemasukan Barang"
              loading={loading}
              hasData={data.length > 0}
              tab="pemasukan"
              sections={sections}
              columns={["Nama Barang", "Jumlah", "Satuan", "User"]}
              formatSectionTitle={formatMonthLabel}
              renderRow={(item) => (
                <>
                  <TableCell>
                    {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                  </TableCell>
                  <TableCell>{String(item.jumlah)}</TableCell>
                  <TableCell>
                    {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                  </TableCell>
                  <TableCell>{unitLabel(item)}</TableCell>
                </>
              )}
              renderLeafSubtotal={(group) => (
                <SubtotalRow label={`Subtotal ${group.label}`} colSpanLabel={1}>
                  <TableCell className="font-medium">{group.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderSectionSubtotal={(section) => (
                <SubtotalRow
                  label={`Subtotal ${formatMonthLabel(section.title)}`}
                  colSpanLabel={1}
                  tone="section"
                >
                  <TableCell className="font-medium">{section.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderGrandTotal={() => (
                <SubtotalRow
                  label="Total keseluruhan"
                  colSpanLabel={1}
                  tone="grand"
                >
                  <TableCell className="font-medium">{grand.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="pengeluaran">
            <TransaksiTab
              title="Laporan Pengeluaran Barang"
              loading={loading}
              hasData={data.length > 0}
              tab="pengeluaran"
              sections={sections}
              columns={["Nama Barang", "Jumlah", "Satuan", "User"]}
              formatSectionTitle={formatMonthLabel}
              renderRow={(item) => (
                <>
                  <TableCell>
                    {(item.stokbarang as { namaBrg?: string })?.namaBrg ?? ""}
                  </TableCell>
                  <TableCell>{String(item.jumlah)}</TableCell>
                  <TableCell>
                    {(item.stokbarang as { satuan?: string })?.satuan ?? ""}
                  </TableCell>
                  <TableCell>{unitLabel(item)}</TableCell>
                </>
              )}
              renderLeafSubtotal={(group) => (
                <SubtotalRow label={`Subtotal ${group.label}`} colSpanLabel={1}>
                  <TableCell className="font-medium">{group.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderSectionSubtotal={(section) => (
                <SubtotalRow
                  label={`Subtotal ${formatMonthLabel(section.title)}`}
                  colSpanLabel={1}
                  tone="section"
                >
                  <TableCell className="font-medium">{section.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              renderGrandTotal={() => (
                <SubtotalRow
                  label="Total keseluruhan"
                  colSpanLabel={1}
                  tone="grand"
                >
                  <TableCell className="font-medium">{grand.jumlah}</TableCell>
                  <TableCell />
                  <TableCell />
                </SubtotalRow>
              )}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </TabsContent>

          <TabsContent value="stok">
            <TransaksiTab
              title="Laporan Stok Barang"
              loading={loading}
              hasData={data.length > 0}
              tab="stok"
              sections={sections}
              columns={[
                "Kode Barang",
                "Nama Barang",
                "Stok",
                "Keluar",
                "Sisa",
                "Satuan",
              ]}
              renderRow={(item) => (
                <>
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
                </>
              )}
              renderLeafSubtotal={(group) => (
                <SubtotalRow
                  label={`Subtotal ${group.label}`}
                  colSpanLabel={2}
                >
                  <TableCell className="font-medium">{group.stok}</TableCell>
                  <TableCell className="font-medium">{group.keluar}</TableCell>
                  <TableCell className="font-medium">{group.sisa}</TableCell>
                  <TableCell />
                </SubtotalRow>
              )}
              renderGrandTotal={() => (
                <SubtotalRow
                  label="Total keseluruhan"
                  colSpanLabel={2}
                  tone="grand"
                >
                  <TableCell className="font-medium">{grand.stok}</TableCell>
                  <TableCell className="font-medium">{grand.keluar}</TableCell>
                  <TableCell className="font-medium">{grand.sisa}</TableCell>
                  <TableCell />
                </SubtotalRow>
              )}
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function TransaksiTab({
  title,
  loading,
  hasData,
  tab,
  sections,
  columns,
  formatSectionTitle,
  renderRow,
  renderLeafSubtotal,
  renderSectionSubtotal,
  renderGrandTotal,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  title: string
  loading: boolean
  hasData: boolean
  tab: string
  sections: LaporanSection[]
  columns: string[]
  formatSectionTitle?: (title: string) => string
  renderRow: (item: Record<string, unknown>) => React.ReactNode
  renderLeafSubtotal: (group: LaporanLeafGroup) => React.ReactNode
  renderSectionSubtotal?: (section: LaporanSection) => React.ReactNode
  renderGrandTotal?: () => React.ReactNode
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
}) {
  return (
    <div className="space-y-4">
      <LaporanTabCard title={title} loading={loading} hasData={hasData}>
        <LaporanGroupedTables
          tab={tab}
          sections={sections}
          columns={columns}
          leafHeaderPrefix="Kategori"
          formatSectionTitle={formatSectionTitle}
          renderRow={(item) => <TableRow>{renderRow(item)}</TableRow>}
          renderLeafSubtotal={renderLeafSubtotal}
          renderSectionSubtotal={renderSectionSubtotal}
          renderGrandTotal={hasData ? renderGrandTotal : undefined}
        />
      </LaporanTabCard>
      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  )
}
