"use client"

import { Button } from "@/components/ui/button"

interface TablePaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Label unit di teks ringkas, mis. "data", "batch", "tiket" */
  itemLabel?: string
  className?: string
}

export function TablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  itemLabel = "data",
  className,
}: TablePaginationProps) {
  if (total === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div
      className={
        className ??
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      }
    >
      <p className="text-sm text-muted-foreground">
        Menampilkan {from}–{to} dari {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
