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
    <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
      <DatePicker
        className="w-[160px]"
        value={filters.startDate}
        onChange={(startDate) => onFiltersChange({ ...filters, startDate })}
        placeholder="Tanggal mulai"
      />
      <DatePicker
        className="w-[160px]"
        value={filters.endDate}
        onChange={(endDate) => onFiltersChange({ ...filters, endDate })}
        placeholder="Tanggal akhir"
      />
      <Input
        className="w-[140px]"
        placeholder="Unit"
        value={filters.unit}
        onChange={(e) => onFiltersChange({ ...filters, unit: e.target.value })}
      />
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua</SelectItem>
          <SelectItem value="0">Pending</SelectItem>
          <SelectItem value="1">Disetujui</SelectItem>
          <SelectItem value="2">Ditolak</SelectItem>
        </SelectContent>
      </Select>
      <Button type="button" onClick={onFetch}>
        Tampilkan
      </Button>
    </div>
  )
}
