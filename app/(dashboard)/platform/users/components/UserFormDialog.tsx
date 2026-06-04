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
import type { User, UserFormData } from "../types"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  onSubmit: (formData: UserFormData, editingUser: User | null) => Promise<boolean>
}

const initialFormData: UserFormData = {
  username: "",
  password: "",
  level: "",
  jabatan: "",
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (editingUser) {
        setFormData({
          username: editingUser.username,
          password: "",
          level: editingUser.level,
          jabatan: editingUser.jabatan,
        })
      } else {
        setFormData(initialFormData)
      }
    }
  }, [open, editingUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.level) return
    if (!editingUser && !formData.password) return

    setSubmitting(true)
    const success = await onSubmit(formData, editingUser)
    setSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Tambah User"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Ubah informasi user. Kosongkan password jika tidak ingin mengubah."
              : "Tambahkan user baru ke sistem"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {editingUser && "(kosongkan jika tidak diubah)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <Select
                value={formData.level}
                onValueChange={(
                  value: "user" | "administrator" | "it_support" | "purchasing"
                ) => setFormData({ ...formData, level: value })}
                required
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Pilih Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="purchasing">Purchasing</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="it_support">IT Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                value={formData.jabatan}
                onChange={(e) =>
                  setFormData({ ...formData, jabatan: e.target.value })
                }
                required
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
              {submitting
                ? "Menyimpan..."
                : editingUser
                  ? "Update"
                  : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
