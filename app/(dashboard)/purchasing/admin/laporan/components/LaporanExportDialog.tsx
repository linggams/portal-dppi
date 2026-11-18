"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  selected: string[]
  onSelectedChange: (next: string[]) => void
  onConfirm: () => void
  loading?: boolean
}

export function LaporanExportDialog({
  open,
  onOpenChange,
  categories,
  selected,
  onSelectedChange,
  onConfirm,
  loading,
}: Props) {
  const allChecked =
    categories.length > 0 && selected.length === categories.length

  const toggleAll = (checked: boolean) => {
    onSelectedChange(checked ? [...categories] : [])
  }

  const toggleOne = (name: string, checked: boolean) => {
    if (checked) {
      onSelectedChange(
        Array.from(new Set([...selected, name])).sort((a, b) =>
          a.localeCompare(b, "id")
        )
      )
      return
    }
    onSelectedChange(selected.filter((c) => c !== name))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
          <DialogDescription>
            Pilih kategori yang akan diekspor. Default: semua kategori.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Checkbox
              id="export-kat-all"
              checked={allChecked}
              onCheckedChange={(v) => toggleAll(v === true)}
            />
            <Label htmlFor="export-kat-all" className="font-medium">
              Semua kategori
            </Label>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada kategori pada data saat ini.
              </p>
            ) : (
              categories.map((name) => {
                const id = `export-kat-${name}`
                return (
                  <div key={name} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={selected.includes(name)}
                      onCheckedChange={(v) => toggleOne(name, v === true)}
                    />
                    <Label htmlFor={id} className="font-normal">
                      {name}
                    </Label>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || selected.length === 0}
          >
            {loading ? "Menyiapkan…" : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
