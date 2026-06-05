"use client"

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
import {
  CompactFilterCard,
  FILTER_CONTROL_CLASS,
  FilterField,
} from "@/components/layout"
import type { LaporanFilters as LaporanFiltersType } from "../types"

interface Props {
  filters: LaporanFiltersType
  onFiltersChange: (f: LaporanFiltersType) => void
  onFetch: () => void
}

export function LaporanFiltersComponent({
  filters,
  onFiltersChange,
  onFetch,
}: Props) {
  return (
    <CompactFilterCard
      footer={
        <Button size="sm" onClick={onFetch}>
          Tampilkan
        </Button>
      }
    >
      <FilterField>
        <DatePicker
          className={FILTER_CONTROL_CLASS}
          value={filters.startDate}
          onChange={(startDate) => onFiltersChange({ ...filters, startDate })}
          placeholder="Tanggal mulai"
        />
      </FilterField>
      <FilterField>
        <DatePicker
          className={FILTER_CONTROL_CLASS}
          value={filters.endDate}
          onChange={(endDate) => onFiltersChange({ ...filters, endDate })}
          placeholder="Tanggal akhir"
        />
      </FilterField>
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Unit"
          value={filters.unit}
          onChange={(e) => onFiltersChange({ ...filters, unit: e.target.value })}
        />
      </FilterField>
      <FilterField>
        <Select
          value={filters.status}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="0">Pending</SelectItem>
            <SelectItem value="1">Disetujui</SelectItem>
            <SelectItem value="2">Ditolak</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
    </CompactFilterCard>
  )
}
