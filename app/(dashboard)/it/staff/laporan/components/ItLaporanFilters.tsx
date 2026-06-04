"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IT_PRIORITAS, IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
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
    <Card>
      <CardHeader>
        <CardTitle>Filter Laporan</CardTitle>
        <CardDescription>
          Periode dan filter untuk laporan tiket IT
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                onFiltersChange({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">Tanggal Akhir</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                onFiltersChange({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateField">Berdasarkan</Label>
            <Select
              value={filters.dateField}
              onValueChange={(v: "dibuat" | "selesai") =>
                onFiltersChange({ ...filters, dateField: v })
              }
            >
              <SelectTrigger id="dateField">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dibuat">Tanggal dibuat</SelectItem>
                <SelectItem value="selesai">Tanggal selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
            >
              <SelectTrigger id="status">
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prioritas">Prioritas</Label>
            <Select
              value={filters.prioritas}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, prioritas: v })
              }
            >
              <SelectTrigger id="prioritas">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {IT_PRIORITAS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select
              value={filters.kategoriId}
              onValueChange={(v) =>
                onFiltersChange({ ...filters, kategoriId: v })
              }
            >
              <SelectTrigger id="kategori">
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Pemohon</Label>
            <Input
              id="username"
              placeholder="Username (opsional)"
              value={filters.username}
              onChange={(e) =>
                onFiltersChange({ ...filters, username: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ditugaskanKe">Teknisi</Label>
            <Input
              id="ditugaskanKe"
              placeholder="Ditugaskan ke (opsional)"
              value={filters.ditugaskanKe}
              onChange={(e) =>
                onFiltersChange({ ...filters, ditugaskanKe: e.target.value })
              }
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={onFetch}>Tampilkan Laporan</Button>
        </div>
      </CardContent>
    </Card>
  )
}
