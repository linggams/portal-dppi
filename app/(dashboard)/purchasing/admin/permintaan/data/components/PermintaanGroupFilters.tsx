"use client"

import { PageActionsFilters } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PermintaanGroupFilters } from "../types"

interface Props {
  filters: PermintaanGroupFilters
  onFiltersChange: (filters: PermintaanGroupFilters) => void
  onApply: () => void
  onReset: () => void
}

export function PermintaanGroupFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: Props) {
  return (
    <PageActionsFilters label="Filter" title="Filter requests">
      <DatePicker
        className="w-[160px]"
        value={filters.startDate}
        onChange={(startDate) => onFiltersChange({ ...filters, startDate })}
        placeholder="Start date"
      />
      <DatePicker
        className="w-[160px]"
        value={filters.endDate}
        onChange={(endDate) => onFiltersChange({ ...filters, endDate })}
        placeholder="End date"
      />
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="0">Pending</SelectItem>
          <SelectItem value="1">Approved</SelectItem>
          <SelectItem value="2">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Input
        className="w-[160px]"
        placeholder="Unit / requester"
        value={filters.unit}
        onChange={(e) =>
          onFiltersChange({ ...filters, unit: e.target.value })
        }
      />
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
      <Button type="button" onClick={onApply}>
        Show
      </Button>
    </PageActionsFilters>
  )
}
