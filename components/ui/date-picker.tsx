"use client"

import * as React from "react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseDateOnly(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toDateOnlyString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDateOnly(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 px-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
          {selected ? (
            format(selected, "dd MMM yyyy", { locale: localeId })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toDateOnlyString(date))
              setOpen(false)
            }
          }}
          defaultMonth={selected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { parseDateOnly, toDateOnlyString }
