"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TablePagination } from "@/components/ui/table-pagination"
import { useStok } from "./hooks/useStok"
import { StokLoadingSkeleton, StokTable } from "./components"

export default function UserStokPage() {
  const {
    stokBarang,
    loading,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    formatRupiah,
  } = useStok()

  return (
    <DashboardLayout title="Data Stok Barang">
      <div className="space-y-6">
        {loading ? (
          <StokLoadingSkeleton />
        ) : (
          <div className="space-y-4">
            <StokTable
              stokBarang={stokBarang}
              rowOffset={(page - 1) * pageSize}
              formatRupiah={formatRupiah}
            />
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="barang"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
