"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { danaTerpakai } from "@/lib/dana/constants"
import { formatRupiah, parseRupiahInput } from "@/lib/dana/format"

interface KembalianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: DanaPengajuan | null
  onSubmit: (kembalian: number) => Promise<boolean>
}

export function KembalianDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: KembalianDialogProps) {
  const [kembalian, setKembalian] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const nominal = item?.nominal ?? 0
  const terpakai = danaTerpakai(nominal, kembalian)
  const invalid = kembalian > nominal

  useEffect(() => {
    if (!open) return
    setKembalian(item?.kembalian ?? 0)
  }, [open, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || invalid) return
    setSubmitting(true)
    const ok = await onSubmit(kembalian)
    setSubmitting(false)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Input kembalian</DialogTitle>
            <DialogDescription>
              {item
                ? `Nominal ${item.nomor}: ${formatRupiah(item.nominal)}`
                : "Isi nominal yang dikembalikan."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kembalian">Kembalian</Label>
              <Input
                id="kembalian"
                inputMode="numeric"
                placeholder="Rp 0"
                value={kembalian ? formatRupiah(kembalian) : ""}
                onChange={(e) =>
                  setKembalian(parseRupiahInput(e.target.value))
                }
              />
              {invalid ? (
                <p className="text-xs text-destructive">
                  Kembalian tidak boleh melebihi nominal.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Terpakai {formatRupiah(terpakai)}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting || invalid}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
