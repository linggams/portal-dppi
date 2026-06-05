"use client"

import { usePageTitleValue } from "@/components/layout/page-title-context"
import { cn } from "@/lib/utils"

interface PageContentTitleProps {
  className?: string
}

/** Judul halaman di area konten — sinkron dengan title header via PageTitleProvider. */
export function PageContentTitle({ className }: PageContentTitleProps) {
  const title = usePageTitleValue()
  if (!title) return null

  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {title}
    </h2>
  )
}
