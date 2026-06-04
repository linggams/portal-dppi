"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useStok } from "./hooks/useStok"
import { StokLoadingSkeleton, StokTable } from "./components"

export default function UserStokPage() {
  const { jenisParam, stokBarang, loading, getJenisName, formatRupiah } = useStok()

  return (
    <DashboardLayout title="Data Stok Barang">
      <div className="space-y-6">
                {loading ? (
          <StokLoadingSkeleton />
        ) : (
          <StokTable stokBarang={stokBarang} formatRupiah={formatRupiah} />
        )}
      </div>
    </DashboardLayout>
  )
}
