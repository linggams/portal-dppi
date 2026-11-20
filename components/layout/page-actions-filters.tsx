"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface PageActionsFiltersProps {
  children: React.ReactNode
  /** Label tombol pemicu di mobile */
  label?: string
  /** Judul sheet mobile */
  title?: string
  className?: string
}

const FILTER_CONTROL_CLASS =
  "[&_button]:h-9 [&_[data-slot=input]]:h-9 [&_[data-slot=select-trigger]]:h-9"

/**
 * Filter untuk PageActions: inline di desktop, Sheet di mobile.
 * Children hanya di-mount sekali (hindari duplikasi kontrol).
 */
export function PageActionsFilters({
  children,
  label = "Filter",
  title = "Filter",
  className,
}: PageActionsFiltersProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  if (!isMobile) {
    return (
      <div
        className={cn(
          "mr-auto flex min-w-0 flex-wrap items-center gap-2",
          FILTER_CONTROL_CLASS,
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85vh] gap-0 rounded-t-xl p-0"
        >
          <SheetHeader className="border-b px-4 py-3 text-left">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div
            className={cn(
              "flex flex-col gap-3 overflow-y-auto px-4 py-4",
              FILTER_CONTROL_CLASS,
              "[&>*]:w-full",
              "[&_[data-slot=input]]:w-full",
              "[&_[data-slot=select-trigger]]:w-full",
              "[&_button]:w-full",
              className
            )}
          >
            {children}
          </div>
          <SheetFooter className="border-t p-4">
            <Button type="button" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
