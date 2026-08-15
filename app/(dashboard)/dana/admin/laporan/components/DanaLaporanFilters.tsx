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
      <Select
        value={filters.status}
        onValueChange={(status) => onFiltersChange({ ...filters, status })}
      >
        <SelectTrigger className="w-[160px]">
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
      <Input
        className="w-[180px]"
        placeholder="Cari nomor / pemohon"
        value={filters.q}
        onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
      />
      <Input
        className="w-[140px]"
        placeholder="Jabatan"
        value={filters.jabatan}
        onChange={(e) =>
          onFiltersChange({ ...filters, jabatan: e.target.value })
        }
      />
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
      <Button type="button" onClick={onFetch}>
        Tampilkan
      </Button>
    </div>
  )
}
