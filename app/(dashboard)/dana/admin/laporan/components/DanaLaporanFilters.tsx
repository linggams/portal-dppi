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
import { DANA_STATUS_LABEL } from "@/lib/dana/constants"
import type { DanaLaporanFilterState } from "../types"

interface Props {
  filters: DanaLaporanFilterState
  onFiltersChange: (f: DanaLaporanFilterState) => void
  onFetch: () => void
  onReset: () => void
}

export function DanaLaporanFilters({
  filters,
  onFiltersChange,
  onFetch,
  onReset,
}: Props) {
  return (
    <CompactFilterCard
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button size="sm" onClick={onFetch}>
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
          onValueChange={(status) => onFiltersChange({ ...filters, status })}
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {Object.entries(DANA_STATUS_LABEL).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Cari nomor / pemohon"
          value={filters.q}
          onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
        />
      </FilterField>
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Jabatan"
          value={filters.jabatan}
          onChange={(e) =>
            onFiltersChange({ ...filters, jabatan: e.target.value })
          }
        />
      </FilterField>
    </CompactFilterCard>
  )
}
