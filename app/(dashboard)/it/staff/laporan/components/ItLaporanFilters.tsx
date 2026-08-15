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
        value={filters.dateField}
        onValueChange={(v: "dibuat" | "selesai") =>
          onFiltersChange({ ...filters, dateField: v })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Berdasarkan tanggal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dibuat">Tanggal dibuat</SelectItem>
          <SelectItem value="selesai">Tanggal selesai</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px]">
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
      <Select
        value={filters.kategoriId}
        onValueChange={(v) => onFiltersChange({ ...filters, kategoriId: v })}
      >
        <SelectTrigger className="w-[160px]">
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
      <Input
        className="w-[140px]"
        placeholder="Pemohon"
        value={filters.username}
        onChange={(e) =>
          onFiltersChange({ ...filters, username: e.target.value })
        }
      />
      <Input
        className="w-[140px]"
        placeholder="Teknisi"
        value={filters.ditugaskanKe}
        onChange={(e) =>
          onFiltersChange({ ...filters, ditugaskanKe: e.target.value })
        }
      />
      <Button type="button" onClick={onFetch}>
        Tampilkan
      </Button>
    </div>
  )
}
