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
import type { PengajuanGroupFilters } from "../types"

interface Props {
  filters: PengajuanGroupFilters
  onFiltersChange: (filters: PengajuanGroupFilters) => void
  onApply: () => void
  onReset: () => void
}

export function PengajuanGroupFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: Props) {
  return (
    <CompactFilterCard
      title="Filter Data"
      description="Periode dan filter pengajuan barang"
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
        <FilterField label="Status" htmlFor="status">
          <Select
            value={filters.status}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v })
            }
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
        <FilterField label="Unit / Pemohon" htmlFor="unit">
          <Input
            id="unit"
            className={FILTER_CONTROL_CLASS}
            placeholder="Cari unit..."
            value={filters.unit}
            onChange={(e) =>
              onFiltersChange({ ...filters, unit: e.target.value })
            }
          />
        </FilterField>
      </div>
    </CompactFilterCard>
  )
}
