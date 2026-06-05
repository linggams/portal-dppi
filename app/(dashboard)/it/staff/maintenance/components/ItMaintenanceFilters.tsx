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
import {
  IT_HASIL_PEKERJAAN_LABEL,
  MAINTENANCE_SUMBER_LABEL,
} from "@/lib/it/maintenance-shared"
import type { MaintenanceFilters } from "../types"

interface KategoriOption {
  idKategori: number
  nama: string
}

interface Props {
  filters: MaintenanceFilters
  kategori: KategoriOption[]
  onFiltersChange: (f: MaintenanceFilters) => void
  onFetch: () => void
}

export function ItMaintenanceFilters({
  filters,
  kategori,
  onFiltersChange,
  onFetch,
}: Props) {
  return (
    <CompactFilterCard
      footer={
        <Button
          size="sm"
          onClick={onFetch}
          disabled={!filters.startDate || !filters.endDate}
        >
          Terapkan
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
        <Select
          value={filters.kategoriId}
          onValueChange={(v) => onFiltersChange({ ...filters, kategoriId: v })}
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {kategori.map((k) => (
              <SelectItem key={k.idKategori} value={String(k.idKategori)}>
                {k.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Teknisi"
          value={filters.username}
          onChange={(e) =>
            onFiltersChange({ ...filters, username: e.target.value })
          }
        />
      </FilterField>
      <FilterField>
        <Select
          value={filters.sumber}
          onValueChange={(v) => onFiltersChange({ ...filters, sumber: v })}
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Sumber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua sumber</SelectItem>
            <SelectItem value="tiket">
              {MAINTENANCE_SUMBER_LABEL.tiket}
            </SelectItem>
            <SelectItem value="manual">
              {MAINTENANCE_SUMBER_LABEL.manual}
            </SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField>
        <Select
          value={filters.hasil}
          onValueChange={(v) => onFiltersChange({ ...filters, hasil: v })}
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Hasil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(IT_HASIL_PEKERJAAN_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField className="sm:min-w-[200px] sm:flex-[2] lg:min-w-[240px]">
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Cari judul, no. tiket, lokasi..."
          value={filters.q}
          onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
        />
      </FilterField>
    </CompactFilterCard>
  )
}
