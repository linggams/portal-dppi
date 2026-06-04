"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DataPermintaanSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            {[...Array(2)].map((_, j) => (
              <Skeleton key={j} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
