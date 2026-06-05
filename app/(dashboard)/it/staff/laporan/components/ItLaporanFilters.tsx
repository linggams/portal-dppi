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
      footer={
        <Button size="sm" onClick={onFetch}>
          Tampilkan
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
          value={filters.dateField}
          onValueChange={(v: "dibuat" | "selesai") =>
            onFiltersChange({ ...filters, dateField: v })
          }
        >
          <SelectTrigger className={FILTER_CONTROL_CLASS}>
            <SelectValue placeholder="Berdasarkan tanggal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dibuat">Tanggal dibuat</SelectItem>
            <SelectItem value="selesai">Tanggal selesai</SelectItem>
          </SelectContent>
        </Select>
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
            {Object.entries(IT_TIKET_STATUS_LABEL).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            <SelectItem value="all">Semua</SelectItem>
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
          placeholder="Pemohon"
          value={filters.username}
          onChange={(e) =>
            onFiltersChange({ ...filters, username: e.target.value })
          }
        />
      </FilterField>
      <FilterField>
        <Input
          className={FILTER_CONTROL_CLASS}
          placeholder="Teknisi"
          value={filters.ditugaskanKe}
          onChange={(e) =>
            onFiltersChange({ ...filters, ditugaskanKe: e.target.value })
          }
        />
      </FilterField>
    </CompactFilterCard>
  )
}
