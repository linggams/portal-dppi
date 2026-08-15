"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { RoleListItem } from "@/lib/platform/role-types"
import {
  ALL_APPLICANT_MODULES,
  APPLICANT_MODULE_OPTIONS,
  EMPTY_APPLICANT_MODULES,
  hasAnyApplicantModule,
  type ApplicantModules,
} from "@/lib/auth/applicant-modules"
import {
  ALL_MANAGER_MODULES,
  EMPTY_MANAGER_MODULES,
  MANAGER_MODULE_OPTIONS,
  hasAnyManagerModule,
  type ManagerModules,
} from "@/lib/auth/manager-modules"
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
  roleId: "",
  jabatan: "",
  modules: EMPTY_MANAGER_MODULES,
  accessModules: EMPTY_APPLICANT_MODULES,
}

function modulesFromUser(user: User): ManagerModules {
  return {
    managePurchasing: Boolean(user.managePurchasing),
    manageIt: Boolean(user.manageIt),
    manageDana: Boolean(user.manageDana),
    manageMobil: Boolean(user.manageMobil),
  }
}

function accessModulesFromUser(user: User): ApplicantModules {
  return {
    accessPurchasing: Boolean(user.accessPurchasing),
    accessIt: Boolean(user.accessIt),
    accessDana: Boolean(user.accessDana),
    accessMobil: Boolean(user.accessMobil),
  }
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
}: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [roles, setRoles] = useState<RoleListItem[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    fetch("/api/platform/roles")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: RoleListItem[]) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]))

    if (editingUser) {
      setFormData({
        username: editingUser.username,
        password: "",
        roleId: editingUser.roleId,
        jabatan: editingUser.jabatan,
        modules: modulesFromUser(editingUser),
        accessModules: accessModulesFromUser(editingUser),
      })
    } else {
      setFormData(initialFormData)
    }
  }, [open, editingUser])

  const selectedRole = roles.find((role) => role.idRole === formData.roleId)
  const isPengelola = Boolean(selectedRole?.capabilities.platform)
  const isPemohon = Boolean(selectedRole) && !isPengelola
  const canSubmit =
    Boolean(formData.roleId) &&
    (Boolean(editingUser) || Boolean(formData.password)) &&
    (!isPengelola || hasAnyManagerModule(formData.modules)) &&
    (!isPemohon || hasAnyApplicantModule(formData.accessModules))

  const handleRoleChange = (value: string) => {
    const roleId = Number(value)
    const role = roles.find((item) => item.idRole === roleId)
    const nextPengelola = Boolean(role?.capabilities.platform)
    setFormData({
      ...formData,
      roleId,
      modules: nextPengelola ? ALL_MANAGER_MODULES : EMPTY_MANAGER_MODULES,
      accessModules: nextPengelola
        ? EMPTY_APPLICANT_MODULES
        : ALL_APPLICANT_MODULES,
    })
  }

  const handleModuleChange = (key: keyof ManagerModules, checked: boolean) => {
    setFormData({
      ...formData,
      modules: { ...formData.modules, [key]: checked },
    })
  }

  const handleAccessModuleChange = (
    key: keyof ApplicantModules,
    checked: boolean
  ) => {
    setFormData({
      ...formData,
      accessModules: { ...formData.accessModules, [key]: checked },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    const success = await onSubmit(formData, editingUser)
    setSubmitting(false)

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.roleId ? String(formData.roleId) : ""}
                onValueChange={handleRoleChange}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.idRole} value={String(role.idRole)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole?.description ? (
                <p className="text-xs text-muted-foreground">
                  {selectedRole.description}
                </p>
              ) : null}
            </div>
            {isPengelola ? (
              <div className="grid gap-2">
                <Label>Modul yang dikelola</Label>
                <div className="rounded-md border p-3 space-y-3">
                  {MANAGER_MODULE_OPTIONS.map((option) => (
                    <label
                      key={option.key}
                      htmlFor={option.key}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <Checkbox
                        id={option.key}
                        checked={Boolean(formData.modules[option.key])}
                        onCheckedChange={(checked) =>
                          handleModuleChange(option.key, checked === true)
                        }
                        className="mt-0.5"
                      />
                      <span className="grid gap-0.5">
                        <span className="text-sm font-medium leading-none">
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {!hasAnyManagerModule(formData.modules) ? (
                  <p className="text-xs text-destructive">
                    Pilih minimal satu modul.
                  </p>
                ) : null}
              </div>
            ) : null}
            {isPemohon ? (
              <div className="grid gap-2">
                <Label>Akses modul</Label>
                <div className="rounded-md border p-3 space-y-3">
                  {APPLICANT_MODULE_OPTIONS.map((option) => (
                    <label
                      key={option.key}
                      htmlFor={option.key}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <Checkbox
                        id={option.key}
                        checked={Boolean(formData.accessModules[option.key])}
                        onCheckedChange={(checked) =>
                          handleAccessModuleChange(option.key, checked === true)
                        }
                        className="mt-0.5"
                      />
                      <span className="grid gap-0.5">
                        <span className="text-sm font-medium leading-none">
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {!hasAnyApplicantModule(formData.accessModules) ? (
                  <p className="text-xs text-destructive">
                    Pilih minimal satu modul.
                  </p>
                ) : null}
              </div>
            ) : null}
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
            <Button type="submit" disabled={submitting || !canSubmit}>
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
