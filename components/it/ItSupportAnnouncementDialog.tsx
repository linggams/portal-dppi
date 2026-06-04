"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const STORAGE_KEY_PREFIX = "it-support-announcement-seen"

function getStorageKey(username: string) {
  return `${STORAGE_KEY_PREFIX}:${username}`
}

interface ItSupportAnnouncementDialogProps {
  username: string
}

export function ItSupportAnnouncementDialog({
  username,
}: ItSupportAnnouncementDialogProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!username) return

    const seen = localStorage.getItem(getStorageKey(username))
    if (!seen) {
      setOpen(true)
    }
  }, [username])

  const dismiss = () => {
    localStorage.setItem(getStorageKey(username), "1")
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Informasi Fitur IT Support</DialogTitle>
          <DialogDescription asChild>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Untuk setiap permasalahan IT, mohon tidak menghubungi langsung
              tanpa tiket. Buat tiket melalui{" "}
              <span className="font-medium text-foreground">
                Ajukan Tiket Gangguan
              </span>{" "}
              supaya permintaan Anda tercatat dan masuk antrian pengerjaan
              sesuai urutan.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={dismiss}>
            Mengerti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
