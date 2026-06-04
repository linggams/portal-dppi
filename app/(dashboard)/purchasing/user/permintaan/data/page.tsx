"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useDataPermintaan } from "./hooks/useDataPermintaan"
import { DataPermintaanTable, DataPermintaanSkeleton } from "./components"

export default function DataPermintaanPage() {
  const { loading, groupedPermintaan, formatDate } = useDataPermintaan()
  const hasData = Object.keys(groupedPermintaan).length > 0

  return (
    <DashboardLayout title="Data Permintaan Barang">
      <div className="space-y-6">
                {loading ? (
          <DataPermintaanSkeleton />
        ) : !hasData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data permintaan</p>
          </div>
        ) : (
          <DataPermintaanTable
            groupedPermintaan={groupedPermintaan}
            formatDate={formatDate}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
