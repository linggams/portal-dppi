"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StokBarang, JenisBarang, StokFormData } from "../types"

interface StokFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingStok: StokBarang | null
  jenisBarang: JenisBarang[]
  defaultJenis: number
  onSubmit: (formData: StokFormData, editingStok: StokBarang | null) => Promise<boolean>
  onFetchNextKode: (idJenis: number) => Promise<string>
}

const initialFormData: StokFormData = {
  kodeBrg: "",
  idJenis: 1,
  namaBrg: "",
  hargabarang: "",
  satuan: "",
  stok: 0,
  keterangan: "",
}

export function StokFormDialog({
  open,
  onOpenChange,
  editingStok,
  jenisBarang,
  defaultJenis,
  onSubmit,
  onFetchNextKode,
}: StokFormDialogProps) {
  const [formData, setFormData] = useState<StokFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (editingStok) {
        setFormData({
          kodeBrg: editingStok.kodeBrg,
          idJenis: editingStok.idJenis,
          namaBrg: editingStok.namaBrg,
          hargabarang: editingStok.hargabarang,
          satuan: editingStok.satuan,
          stok: editingStok.stok,
          keterangan: editingStok.keterangan,
        })
      } else {
        const idJenis = defaultJenis
        setFormData({ ...initialFormData, idJenis })
        onFetchNextKode(idJenis).then((nextKode) => {
          setFormData((prev) => ({ ...prev, kodeBrg: nextKode }))
        })
      }
    }
  }, [open, editingStok, defaultJenis, onFetchNextKode])

  const handleJenisChange = (value: string) => {
    const idJenis = parseInt(value)
    setFormData((prev) => ({ ...prev, idJenis }))
    if (!editingStok) {
      onFetchNextKode(idJenis).then((nextKode) => {
        setFormData((prev) => ({ ...prev, kodeBrg: nextKode }))
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const success = await onSubmit(formData, editingStok)
    setSubmitting(false)
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingStok ? "Edit item stock" : "Add item stock"}
          </DialogTitle>
          <DialogDescription>
            {editingStok
              ? "Update item stock information"
              : "Add new item stock to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="idJenis">Item type</Label>
              <Select
                value={formData.idJenis.toString()}
                onValueChange={handleJenisChange}
                required
              >
                <SelectTrigger id="idJenis">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  {jenisBarang.map((jenis) => (
                    <SelectItem key={jenis.idJenis} value={String(jenis.idJenis)}>
                      {jenis.jenisBrg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kodeBrg">Item code</Label>
              <Input
                id="kodeBrg"
                value={formData.kodeBrg}
                required
                disabled
                placeholder="Auto-generated"
                className="bg-muted"
              />
              {!editingStok && (
                <p className="text-xs text-muted-foreground">
                  Code is auto-generated based on category
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="namaBrg">Item name</Label>
              <Input
                id="namaBrg"
                value={formData.namaBrg}
                onChange={(e) =>
                  setFormData({ ...formData, namaBrg: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hargabarang">Item price</Label>
              <Input
                id="hargabarang"
                type="text"
                value={formData.hargabarang}
                onChange={(e) =>
                  setFormData({ ...formData, hargabarang: e.target.value })
                }
                required
                placeholder="e.g. 50000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="satuan">Unit</Label>
              <Input
                id="satuan"
                value={formData.satuan}
                onChange={(e) =>
                  setFormData({ ...formData, satuan: e.target.value })
                }
                required
                placeholder="e.g. PCE, RIM, PACK"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="keterangan">Notes</Label>
              <Input
                id="keterangan"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || (!editingStok && !formData.kodeBrg)}
            >
              {submitting
                ? "Saving..."
                : editingStok
                  ? "Update"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
