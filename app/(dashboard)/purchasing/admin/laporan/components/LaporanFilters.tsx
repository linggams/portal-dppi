"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LaporanFilters as LaporanFiltersType } from "../types"

interface Props {
  filters: LaporanFiltersType
  onFiltersChange: (f: LaporanFiltersType) => void
  onFetch: () => void
}

export function LaporanFiltersComponent({ filters, onFiltersChange, onFetch }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Laporan</CardTitle>
        <CardDescription>Pilih periode dan filter untuk melihat laporan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input id="startDate" type="date" value={filters.startDate} onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">Tanggal Akhir</Label>
            <Input id="endDate" type="date" value={filters.endDate} onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" placeholder="Nama unit (opsional)" value={filters.unit} onChange={(e) => onFiltersChange({ ...filters, unit: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(v) => onFiltersChange({ ...filters, status: v })}>
              <SelectTrigger id="status"><SelectValue placeholder="Filter Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="0">Pending</SelectItem>
                <SelectItem value="1">Disetujui</SelectItem>
                <SelectItem value="2">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={onFetch}>Tampilkan Laporan</Button>
        </div>
      </CardContent>
    </Card>
  )
}
