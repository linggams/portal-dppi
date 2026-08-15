"use client"

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { cn } from "@/lib/utils"

/** Baris field filter — horizontal, wrap di layar sempit */
const FILTER_GRID_CLASS =
  "flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"

/** Lebar minimum tiap field di baris horizontal */
const FILTER_FIELD_CLASS =
  "min-w-0 w-full sm:min-w-[132px] sm:max-w-full sm:flex-1 lg:w-[148px] lg:flex-none"

export const FILTER_CONTROL_CLASS = "h-8 w-full text-sm"

interface FilterFieldProps {
  label?: string
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
  if (!label) {
    return (
      <div className={cn(FILTER_FIELD_CLASS, className)}>{children}</div>
    )
  }

  return (
    <div className={cn("grid gap-1", FILTER_FIELD_CLASS, className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

interface CompactFilterCardProps {
  title?: string
  description?: string
  headerAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function CompactFilterCard({
  footer,
  children,
  className,
}: CompactFilterCardProps) {
  return (
    <Card className={cn("h-full gap-0 py-0 shadow-sm", className)}>
      <CardContent className="flex h-full flex-col justify-center px-3 py-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className={FILTER_GRID_CLASS}>{children}</div>
          {footer ? (
            <div className="flex shrink-0 flex-wrap gap-2 lg:ml-auto">
              {footer}
            </div>
          ) : null}
        </div>
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
        "grid gap-3 lg:grid-cols-12 lg:items-stretch",
        className
      )}
    >
      <div className={cn("min-w-0", filterSpan)}>{filter}</div>
      <div className={cn("min-w-0", summarySpan)}>{summary}</div>
    </div>
  )
}

interface SummaryMetricProps {
  label: string
  value: React.ReactNode
  className?: string
}

/** Descriptor metrik untuk CompactSummaryGrid (tidak dirender sendiri). */
export function SummaryMetric(_props: SummaryMetricProps) {
  return null
}

function collectSummaryMetrics(children: ReactNode): SummaryMetricProps[] {
  return Children.toArray(children)
    .filter((child): child is ReactElement<SummaryMetricProps> => {
      if (!isValidElement(child)) return false
      const props = child.props as Partial<SummaryMetricProps>
      return typeof props.label === "string" && "value" in props
    })
    .map((child) => child.props)
}

interface CompactSummaryGridProps {
  children: ReactNode
  className?: string
  title?: string
}

export function CompactSummaryGrid({
  children,
  className,
  title = "Ringkasan",
}: CompactSummaryGridProps) {
  const metrics = collectSummaryMetrics(children)
  if (metrics.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      {title ? <Label className="text-foreground">{title}</Label> : null}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              {metrics.map((metric) => (
                <TableHead key={metric.label} className={metric.className}>
                  {metric.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {metrics.map((metric) => (
                <TableCell
                  key={metric.label}
                  className={cn("font-semibold tabular-nums", metric.className)}
                >
                  {metric.value}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
