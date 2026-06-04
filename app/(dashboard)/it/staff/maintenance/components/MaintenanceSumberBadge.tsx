"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  MAINTENANCE_SUMBER_LABEL,
  type MaintenanceSumber,
} from "@/lib/it/maintenance-shared"

interface Props {
  sumber: MaintenanceSumber
  className?: string
}

export function MaintenanceSumberBadge({ sumber, className }: Props) {
  const isTiket = sumber === "tiket"
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 font-medium",
        isTiket
          ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200",
        className
      )}
    >
      {MAINTENANCE_SUMBER_LABEL[sumber]}
    </Badge>
  )
}
