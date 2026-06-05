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
import { IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
import type { ItLaporanFilters } from "../types"

interface KategoriOption {
  idKategori: number
  nama: string
}

interface Props {
  filters: ItLaporanFilters
  kategori: KategoriOption[]
  onFiltersChange: (f: ItLaporanFilters) => void
  onFetch: () => void
}

export function ItLaporanFilters({
  filters,
  kategori,
  onFiltersChange,
  onFetch,
}: Props) {
  return (
    <CompactFilterCard
      title="Filter Laporan"
      description="Periode dan filter tiket IT"
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
        <FilterField label="Berdasarkan" htmlFor="dateField">
          <Select
            value={filters.dateField}
            onValueChange={(v: "dibuat" | "selesai") =>
              onFiltersChange({ ...filters, dateField: v })
            }
          >
            <SelectTrigger id="dateField" className={FILTER_CONTROL_CLASS}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dibuat">Tanggal dibuat</SelectItem>
              <SelectItem value="selesai">Tanggal selesai</SelectItem>
            </SelectContent>
          </Select>
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
              {Object.entries(IT_TIKET_STATUS_LABEL).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Kategori" htmlFor="kategori">
          <Select
            value={filters.kategoriId}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, kategoriId: v })
            }
          >
            <SelectTrigger id="kategori" className={FILTER_CONTROL_CLASS}>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {kategori.map((k) => (
                <SelectItem key={k.idKategori} value={String(k.idKategori)}>
                  {k.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Pemohon" htmlFor="username">
          <Input
            id="username"
            className={FILTER_CONTROL_CLASS}
            placeholder="Username"
            value={filters.username}
            onChange={(e) =>
              onFiltersChange({ ...filters, username: e.target.value })
            }
          />
        </FilterField>
        <FilterField label="Teknisi" htmlFor="ditugaskanKe">
          <Input
            id="ditugaskanKe"
            className={FILTER_CONTROL_CLASS}
            placeholder="Ditugaskan ke"
            value={filters.ditugaskanKe}
            onChange={(e) =>
              onFiltersChange({ ...filters, ditugaskanKe: e.target.value })
            }
          />
        </FilterField>
      </div>
    </CompactFilterCard>
  )
}
