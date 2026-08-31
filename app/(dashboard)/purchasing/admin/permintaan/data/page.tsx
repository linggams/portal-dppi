"use client"

import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { usePermintaanGroups } from "./hooks/usePermintaanGroups"
import {
  PermintaanGroupFilters,
  PermintaanGroupPagination,
  PermintaanGroupSkeleton,
  PermintaanGroupSummary,
  PermintaanGroupTable,
} from "./components"

export default function DataPermintaanAdminPage() {
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
  } = usePermintaanGroups()

  const hasData = groups.length > 0

  return (
    <DashboardLayout title="Data Permintaan Barang">
      <PageActions>
        <PermintaanGroupFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </PageActions>

      <div className="space-y-4">
        {!loading && summary.total > 0 ? (
          <PermintaanGroupSummary summary={summary} />
        ) : null}

        {loading ? (
          <PermintaanGroupSkeleton />
        ) : !hasData ? (
          <div className="rounded-md border py-12 text-center">
            <p className="text-muted-foreground">Tidak ada data permintaan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ubah filter atau periode tanggal
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleResetFilters}
            >
              Reset filter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <PermintaanGroupTable
              groups={groups}
              page={page}
              pageSize={pageSize}
            />
            <PermintaanGroupPagination
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
