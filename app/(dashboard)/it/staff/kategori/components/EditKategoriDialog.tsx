"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface ItKategoriItem {
  idKategori: number
  nama: string
  aktif: boolean
}

interface EditKategoriDialogProps {
  item: ItKategoriItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    id: number,
    data: { nama: string; aktif: boolean }
  ) => Promise<boolean>
}

export function EditKategoriDialog({
  item,
  open,
  onOpenChange,
  onSubmit,
}: EditKategoriDialogProps) {
  const [nama, setNama] = useState("")
  const [aktif, setAktif] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setNama(item.nama)
      setAktif(item.aktif)
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || !nama.trim()) return

    setSubmitting(true)
    const success = await onSubmit(item.idKategori, {
      nama: nama.trim(),
      aktif,
    })
    setSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>
            Ubah nama kategori atau status aktif
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nama">Nama kategori</Label>
              <Input
                id="edit-nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Hardware, Jaringan"
                required
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-aktif">Aktif</Label>
                <p className="text-xs text-muted-foreground">
                  Kategori nonaktif tidak muncul saat user membuat tiket
                </p>
              </div>
              <Switch
                id="edit-aktif"
                checked={aktif}
                onCheckedChange={setAktif}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
