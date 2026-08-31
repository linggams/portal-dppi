"use client"

import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
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
