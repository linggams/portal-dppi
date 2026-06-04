"use client"

import { Button } from "@/components/ui/button"
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
  FILTER_GRID_CLASS,
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
      title="Filter Laporan"
      description="Periode dan unit"
      footer={
        <Button size="sm" onClick={onFetch}>
          Tampilkan
        </Button>
      }
    >
      <div className={FILTER_GRID_CLASS}>
        <FilterField label="Tanggal mulai" htmlFor="startDate">
          <Input
            id="startDate"
            type="date"
            className={FILTER_CONTROL_CLASS}
            value={filters.startDate}
            onChange={(e) =>
              onFiltersChange({ ...filters, startDate: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Tanggal akhir" htmlFor="endDate">
          <Input
            id="endDate"
            type="date"
            className={FILTER_CONTROL_CLASS}
            value={filters.endDate}
            onChange={(e) =>
              onFiltersChange({ ...filters, endDate: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Unit" htmlFor="unit">
          <Input
            id="unit"
            className={FILTER_CONTROL_CLASS}
            placeholder="Nama unit"
            value={filters.unit}
            onChange={(e) =>
              onFiltersChange({ ...filters, unit: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Status" htmlFor="status">
          <Select
            value={filters.status}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
          >
            <SelectTrigger id="status" className={FILTER_CONTROL_CLASS}>
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
      </div>
    </CompactFilterCard>
  )
}
