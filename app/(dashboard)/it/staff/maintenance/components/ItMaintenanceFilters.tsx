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
      title="Filter"
      description="Periode, kategori, dan sumber log"
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
      <div className={FILTER_GRID_CLASS}>
        <FilterField label="Tanggal mulai" htmlFor="mStartDate">
          <Input
            id="mStartDate"
            type="date"
            className={FILTER_CONTROL_CLASS}
            value={filters.startDate}
            onChange={(e) =>
              onFiltersChange({ ...filters, startDate: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Tanggal akhir" htmlFor="mEndDate">
          <Input
            id="mEndDate"
            type="date"
            className={FILTER_CONTROL_CLASS}
            value={filters.endDate}
            onChange={(e) =>
              onFiltersChange({ ...filters, endDate: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Kategori" htmlFor="mKategori">
          <Select
            value={filters.kategoriId}
            onValueChange={(v) => onFiltersChange({ ...filters, kategoriId: v })}
          >
            <SelectTrigger id="mKategori" className={FILTER_CONTROL_CLASS}>
              <SelectValue placeholder="Semua" />
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
        <FilterField label="Teknisi" htmlFor="mTeknisi">
          <Input
            id="mTeknisi"
            className={FILTER_CONTROL_CLASS}
            placeholder="Username"
            value={filters.username}
            onChange={(e) =>
              onFiltersChange({ ...filters, username: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Sumber" htmlFor="mSumber">
          <Select
            value={filters.sumber}
            onValueChange={(v) => onFiltersChange({ ...filters, sumber: v })}
          >
            <SelectTrigger id="mSumber" className={FILTER_CONTROL_CLASS}>
              <SelectValue />
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
        <FilterField label="Hasil" htmlFor="mHasil">
          <Select
            value={filters.hasil}
            onValueChange={(v) => onFiltersChange({ ...filters, hasil: v })}
          >
            <SelectTrigger id="mHasil" className={FILTER_CONTROL_CLASS}>
              <SelectValue />
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
        <FilterField
          label="Cari"
          htmlFor="mQ"
          className="col-span-2 sm:col-span-3 xl:col-span-4"
        >
          <Input
            id="mQ"
            className={FILTER_CONTROL_CLASS}
            placeholder="Judul, no. tiket, lokasi..."
            value={filters.q}
            onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
          />
        </FilterField>
      </div>
    </CompactFilterCard>
  )
}
