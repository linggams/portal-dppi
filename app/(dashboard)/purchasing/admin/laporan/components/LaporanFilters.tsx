"use client"

import { PageActionsFilters } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LaporanFilters as LaporanFiltersType } from "../types"

interface Props {
  filters: LaporanFiltersType
  onFiltersChange: (f: LaporanFiltersType) => void
  onFetch: () => void
  /** Tab stok: sembunyikan filter tanggal/status */
  mode?: "transaksi" | "stok"
  showStatus?: boolean
}

export function LaporanFiltersComponent({
  filters,
  onFiltersChange,
  onFetch,
  mode = "transaksi",
  showStatus = true,
}: Props) {
  if (mode === "stok") {
    return (
      <PageActionsFilters label="Filter" title="Filter reports">
        <Button type="button" onClick={onFetch}>
          Show
        </Button>
      </PageActionsFilters>
    )
  }

  return (
    <PageActionsFilters label="Filter" title="Filter reports">
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
      {showStatus ? (
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
      ) : null}
      <Button type="button" onClick={onFetch}>
        Show
      </Button>
    </PageActionsFilters>
  )
}
