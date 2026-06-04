"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CompactFilterCard,
  FILTER_CONTROL_CLASS,
  FilterField,
} from "@/components/layout"

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
    <CompactFilterCard
      title="Pilih Tanggal"
      description="Tanggal permintaan untuk cetak"
      footer={
        <>
          <Button size="sm" onClick={onShowData}>
            Tampilkan
          </Button>
          {hasData ? (
            <Button size="sm" variant="outline" onClick={onExportAll}>
              Export
            </Button>
          ) : null}
        </>
      }
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
