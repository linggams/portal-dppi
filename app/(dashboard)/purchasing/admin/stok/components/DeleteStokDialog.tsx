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
          <AlertDialogTitle>Delete item stock?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete item stock &quot;{stok?.namaBrg}&quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} variant="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
