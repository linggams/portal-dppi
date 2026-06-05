"use client"

import { Button } from "@/components/ui/button"
import { PageSection } from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"
import { TableContainer } from "@/components/ui/table-container"
import { Download } from "lucide-react"

interface LaporanTabCardProps {
  title: string
  loading: boolean
  hasData: boolean
  onExport?: () => void
  children: React.ReactNode
}

const KOP = (
  <div className="mb-4 border-b pb-4 text-center">
    <h2 className="text-lg font-bold text-foreground">
      PT DASAN PAN PACIFIC INDONESIA
    </h2>
    <p className="text-sm text-muted-foreground">
      Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa
      Barat 43355
    </p>
  </div>
)

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
            <Download className="mr-1.5 size-3.5" />
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
        <>
          {KOP}
          <TableContainer>{children}</TableContainer>
        </>
      )}
    </PageSection>
  )
}
