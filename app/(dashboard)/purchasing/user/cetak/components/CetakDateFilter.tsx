"use client"

import { DatePicker } from "@/components/ui/date-picker"
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
    <CompactFilterCard>
      <FilterField className="sm:max-w-xs">
        <DatePicker
          className={FILTER_CONTROL_CLASS}
          value={selectedDate}
          onChange={onDateChange}
          placeholder="Tanggal permintaan"
        />
      </FilterField>
    </CompactFilterCard>
  )
}
