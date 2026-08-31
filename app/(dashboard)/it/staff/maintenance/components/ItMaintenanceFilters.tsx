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
        value={filters.kategoriId}
        onValueChange={(v) => onFiltersChange({ ...filters, kategoriId: v })}
      >
        <SelectTrigger className="w-[160px]">
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
      <Input
        className="w-[140px]"
        placeholder="Teknisi"
        value={filters.username}
        onChange={(e) =>
          onFiltersChange({ ...filters, username: e.target.value })
        }
      />
      <Select
        value={filters.sumber}
        onValueChange={(v) => onFiltersChange({ ...filters, sumber: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sumber" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua sumber</SelectItem>
          <SelectItem value="tiket">{MAINTENANCE_SUMBER_LABEL.tiket}</SelectItem>
          <SelectItem value="manual">
            {MAINTENANCE_SUMBER_LABEL.manual}
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.hasil}
        onValueChange={(v) => onFiltersChange({ ...filters, hasil: v })}
      >
        <SelectTrigger className="w-[140px]">
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
      <Input
        className="w-[220px]"
        placeholder="Cari judul, no. tiket, lokasi..."
        value={filters.q}
        onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
      />
      <Button
        type="button"
        onClick={onFetch}
        disabled={!filters.startDate || !filters.endDate}
      >
        Terapkan
      </Button>
    </div>
  )
}
