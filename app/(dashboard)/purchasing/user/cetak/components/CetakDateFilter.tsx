"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CetakDateFilterProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onShowData: () => void
  onExportAll: () => void
  hasData: boolean
}

export function CetakDateFilter({
  selectedDate,
  onDateChange,
  onShowData,
  onExportAll,
  hasData,
}: CetakDateFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Tanggal</CardTitle>
        <CardDescription>
          Pilih tanggal permintaan yang ingin dicetak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="date">Tanggal Permintaan</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={onShowData}>
              Tampilkan Data
            </Button>
            {hasData && (
              <Button variant="outline" onClick={onExportAll}>
                Export
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
