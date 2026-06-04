"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TableContainer } from "@/components/ui/table-container"

interface LaporanTabCardProps {
  title: string
  loading: boolean
  hasData: boolean
  onExport: () => void
  children: React.ReactNode
}

const KOP = (
  <div className="text-center mb-4 pb-4 border-b">
    <h2 className="text-lg font-bold text-foreground">
      PT DASAN PAN PACIFIC INDONESIA
    </h2>
    <p className="text-sm text-muted-foreground">
      Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{title}</CardTitle>
        {hasData && (
          <Button variant="outline" size="sm" onClick={onExport}>
            Ekspor
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !hasData ? (
          <p className="text-center text-muted-foreground py-12">
            Tidak ada data
          </p>
        ) : (
          <>
            {KOP}
            <TableContainer>{children}</TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
