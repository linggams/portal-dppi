"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function PermintaanGroupSkeleton() {
  return (
    <div className="space-y-2 rounded-md border p-4">
      <Skeleton className="h-10 w-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
