"use client"

import { PageSection } from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"

interface LaporanTabCardProps {
  title: string
  loading: boolean
  hasData: boolean
  children: React.ReactNode
}

export function LaporanTabCard({
  title,
  loading,
  hasData,
  children,
}: LaporanTabCardProps) {
  return (
    <PageSection title={title}>
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
        <div className="space-y-3">{children}</div>
      )}
    </PageSection>
  )
}
