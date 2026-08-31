"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TablePagination } from "@/components/ui/table-pagination"
import { useDataPermintaan } from "./hooks/useDataPermintaan"
import { DataPermintaanTable, DataPermintaanSkeleton } from "./components"

export default function DataPermintaanPage() {
  const {
    loading,
    groupedPermintaan,
    formatDate,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
  } = useDataPermintaan()
  const hasData = Object.keys(groupedPermintaan).length > 0

  return (
    <DashboardLayout title="Data Permintaan Barang">
      <div className="space-y-6">
        {loading ? (
          <DataPermintaanSkeleton />
        ) : total === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data permintaan</p>
          </div>
        ) : (
          <>
            {hasData ? (
              <DataPermintaanTable
                groupedPermintaan={groupedPermintaan}
                formatDate={formatDate}
              />
            ) : null}
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="batch"
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
