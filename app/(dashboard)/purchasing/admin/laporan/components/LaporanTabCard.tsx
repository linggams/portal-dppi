"use client"

import { Button } from "@/components/ui/button"
import { PageSection } from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"
import { TableContainer } from "@/components/ui/table-container"

interface LaporanTabCardProps {
  title: string
  loading: boolean
  hasData: boolean
  onExport?: () => void
  children: React.ReactNode
}

export function LaporanTabCard({
  title,
  loading,
  hasData,
  onExport,
  children,
}: LaporanTabCardProps) {
  return (
    <PageSection
      title={title}
      action={
        onExport && hasData ? (
          <Button variant="outline" size="sm" onClick={onExport}>
            Ekspor
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !hasData ? (
        <p className="py-12 text-center text-muted-foreground">Tidak ada data</p>
      ) : (
        <TableContainer>{children}</TableContainer>
      )}
    </PageSection>
  )
}
