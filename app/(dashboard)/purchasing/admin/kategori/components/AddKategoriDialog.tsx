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
import type { KategoriFormData } from "../types"

interface AddKategoriDialogProps {
  onSubmit: (formData: KategoriFormData) => Promise<boolean>
  children?: React.ReactNode
}

export function AddKategoriDialog({ onSubmit, children }: AddKategoriDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<KategoriFormData>({ jenisBrg: "" })
  const [submitting, setSubmitting] = useState(false)

  const handleOpen = () => {
    setFormData({ jenisBrg: "" })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.jenisBrg.trim()) return

    setSubmitting(true)
    const success = await onSubmit(formData)
    setSubmitting(false)

    if (success) {
      setOpen(false)
      setFormData({ jenisBrg: "" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? <Button onClick={handleOpen}>Tambah Kategori</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
          <DialogDescription>
            Masukkan informasi kategori baru
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="jenisBrg">Nama Kategori</Label>
              <Input
                id="jenisBrg"
                value={formData.jenisBrg}
                onChange={(e) =>
                  setFormData({ ...formData, jenisBrg: e.target.value })
                }
                placeholder="Contoh: PERLENGKAPAN KANTOR"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
