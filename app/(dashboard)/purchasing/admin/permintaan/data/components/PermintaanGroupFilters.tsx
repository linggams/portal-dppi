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
    <CompactFilterCard
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button size="sm" onClick={onApply}>
            Tampilkan
          </Button>
        </>
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
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Unit / pemohon"
          value={filters.unit}
          onChange={(e) =>
            onFiltersChange({ ...filters, unit: e.target.value })
          }
        />
      </FilterField>
    </CompactFilterCard>
  )
}
