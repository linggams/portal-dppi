"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DANA_KEPERLUAN_MAX,
  DANA_NOMINAL_MAX,
  DANA_STATUS,
} from "@/lib/dana/constants"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { formatRupiah, parseRupiahInput } from "@/lib/dana/format"

interface PengajuanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: DanaPengajuan | null
  onSubmit: (payload: {
    nominal: number
    keperluan: string
  }) => Promise<boolean>
}

export function PengajuanFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: PengajuanFormDialogProps) {
  const [nominal, setNominal] = useState(0)
  const [keperluan, setKeperluan] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setNominal(editing?.nominal ?? 0)
    setKeperluan(editing?.keperluan ?? "")
  }, [open, editing])

  const isResubmit = editing?.status === DANA_STATUS.REJECTED
  const title = editing
    ? isResubmit
      ? "Revisi & kirim ulang"
      : "Revisi pengajuan"
    : "Ajukan dana"
  const submitLabel = editing
    ? isResubmit
      ? "Kirim ulang"
      : "Simpan revisi"
    : "Kirim"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nominal <= 0 || !keperluan.trim()) return

    setSubmitting(true)
    const ok = await onSubmit({
      nominal,
      keperluan: keperluan.trim(),
    })
    setSubmitting(false)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {editing
                ? `Nomor ${editing.nomor}`
                : "Isi nominal dan keperluan pengajuan dana."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nominal">Nominal</Label>
              <Input
                id="nominal"
                inputMode="numeric"
                placeholder="Rp 0"
                value={nominal ? formatRupiah(nominal) : ""}
                onChange={(e) => {
                  const next = parseRupiahInput(e.target.value)
                  setNominal(Math.min(next, DANA_NOMINAL_MAX))
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keperluan">Keperluan</Label>
              <Textarea
                id="keperluan"
                rows={4}
                maxLength={DANA_KEPERLUAN_MAX}
                placeholder="Jelaskan keperluan pengajuan dana"
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
              />
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
            <Button
              type="submit"
              disabled={submitting || nominal <= 0 || keperluan.trim().length < 3}
            >
              {submitting ? "Menyimpan..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
