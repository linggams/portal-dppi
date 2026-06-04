"use client"

import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Grid field filter — padat, banyak kolom di layar lebar */
export const FILTER_GRID_CLASS =
  "grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"

export const FILTER_CONTROL_CLASS = "h-8 text-sm"

interface FilterFieldProps {
  label: string
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function FilterField({
  label,
  htmlFor,
  className,
  children,
}: FilterFieldProps) {
  return (
    <div className={cn("grid gap-1", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

interface CompactFilterCardProps {
  title: string
  description?: string
  headerAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function CompactFilterCard({
  title,
  description,
  headerAction,
  footer,
  children,
  className,
}: CompactFilterCardProps) {
  return (
    <Card className={cn("gap-0 py-0 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-4 py-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold leading-none">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-1 text-xs leading-snug">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {headerAction ? (
          <div className="shrink-0">{headerAction}</div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-3 pt-0">
        {children}
        {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
      </CardContent>
    </Card>
  )
}

interface FilterSummaryPanelProps {
  filter: ReactNode
  summary?: ReactNode
  className?: string
  /** Lebar kolom filter di desktop (default 8/12) */
  filterCols?: 7 | 8 | 9
}

export function FilterSummaryPanel({
  filter,
  summary,
  className,
  filterCols = 8,
}: FilterSummaryPanelProps) {
  const filterSpan =
    filterCols === 9 ? "lg:col-span-9" : filterCols === 7 ? "lg:col-span-7" : "lg:col-span-8"
  const summarySpan =
    filterCols === 9 ? "lg:col-span-3" : filterCols === 7 ? "lg:col-span-5" : "lg:col-span-4"

  if (!summary) {
    return <div className={className}>{filter}</div>
  }

  return (
    <div
      className={cn(
        "grid gap-3 lg:grid-cols-12 lg:items-start",
        className
      )}
    >
      <div className={cn("min-w-0", filterSpan)}>{filter}</div>
      <div className={cn("min-w-0", summarySpan)}>{summary}</div>
    </div>
  )
}

const SUMMARY_COL_CLASS: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}

/** Grid ringkasan — maksimal 4 kolom */
export const SUMMARY_GRID_CLASS = `grid gap-2 ${SUMMARY_COL_CLASS[4]}`

interface CompactSummaryGridProps {
  children: ReactNode
  className?: string
  /** Kolom maksimum (1–4), default 4 */
  maxCols?: 1 | 2 | 3 | 4
}

export function CompactSummaryGrid({
  children,
  className,
  maxCols = 4,
}: CompactSummaryGridProps) {
  return (
    <Card className={cn("gap-0 py-0 shadow-sm h-full", className)}>
      <CardHeader className="px-3 py-2.5">
        <CardTitle className="text-sm font-semibold">Ringkasan</CardTitle>
      </CardHeader>
      <CardContent
        className={cn("grid gap-2 px-3 pb-3 pt-0", SUMMARY_COL_CLASS[maxCols])}
      >
        {children}
      </CardContent>
    </Card>
  )
}
