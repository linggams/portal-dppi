"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"

interface AddKategoriDialogProps {
  onSubmit: (nama: string) => Promise<boolean>
}

export function AddKategoriDialog({ onSubmit }: AddKategoriDialogProps) {
  const [open, setOpen] = useState(false)
  const [nama, setNama] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setNama("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) return

    setSubmitting(true)
    const success = await onSubmit(nama.trim())
    setSubmitting(false)

    if (success) {
      setNama("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Tambah Kategori</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
          <DialogDescription>
            Kategori baru untuk klasifikasi tiket IT
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-nama">Nama kategori</Label>
              <Input
                id="add-nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Hardware, Jaringan"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
