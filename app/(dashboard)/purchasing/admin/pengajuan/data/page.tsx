"use client"

import { DashboardLayout, FilterSummaryPanel } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { usePengajuanGroups } from "./hooks/usePengajuanGroups"
import {
  PengajuanGroupFilters,
  PengajuanGroupPagination,
  PengajuanGroupSkeleton,
  PengajuanGroupSummary,
  PengajuanGroupTable,
} from "./components"

export default function DataPengajuanPage() {
  const {
    filters,
    setFilters,
    page,
    setPage,
    groups,
    summary,
    total,
    totalPages,
    pageSize,
    loading,
    handleApplyFilters,
    handleResetFilters,
  } = usePengajuanGroups()

  const hasData = groups.length > 0

  return (
    <DashboardLayout title="Data Pengajuan Barang">
      <div className="space-y-4">
        <FilterSummaryPanel
          filter={
            <PengajuanGroupFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          }
          summary={
            !loading && summary.total > 0 ? (
              <PengajuanGroupSummary summary={summary} />
            ) : undefined
          }
        />

        {loading ? (
          <PengajuanGroupSkeleton />
        ) : !hasData ? (
          <div className="rounded-md border py-12 text-center">
            <p className="text-muted-foreground">Tidak ada data pengajuan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ubah filter atau periode tanggal
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleResetFilters}
            >
              Reset filter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <PengajuanGroupTable
              groups={groups}
              page={page}
              pageSize={pageSize}
            />
            <PengajuanGroupPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
