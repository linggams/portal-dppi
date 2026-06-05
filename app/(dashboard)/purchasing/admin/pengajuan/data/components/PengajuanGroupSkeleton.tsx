"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PengajuanGroupSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-36 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
      <div className="space-y-2 rounded-md border p-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
