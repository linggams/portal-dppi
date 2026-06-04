"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { StokBarang } from "../types"

interface DeleteStokDialogProps {
  stok: StokBarang | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (stok: StokBarang) => Promise<boolean>
}

export function DeleteStokDialog({
  stok,
  open,
  onOpenChange,
  onConfirm,
}: DeleteStokDialogProps) {
  const handleDelete = async () => {
    if (!stok) return
    const success = await onConfirm(stok)
    if (success) onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Stok Barang?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus stok barang &quot;{stok?.namaBrg}&quot;?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant="destructive">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
