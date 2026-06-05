"use client"

import { Input } from "@/components/ui/input"
import {
  CompactFilterCard,
  FILTER_CONTROL_CLASS,
  FilterField,
} from "@/components/layout"

interface CetakDateFilterProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function CetakDateFilter({
  selectedDate,
  onDateChange,
}: CetakDateFilterProps) {
  return (
    <CompactFilterCard
      title="Pilih Tanggal"
      description="Tanggal permintaan untuk cetak"
    >
      <div className="max-w-xs">
        <FilterField label="Tanggal permintaan" htmlFor="date">
          <Input
            id="date"
            type="date"
            className={FILTER_CONTROL_CLASS}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </FilterField>
      </div>
    </CompactFilterCard>
  )
}
