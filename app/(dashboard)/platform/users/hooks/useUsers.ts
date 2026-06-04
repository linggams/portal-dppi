"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { User, UserFormData } from "../types"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/platform/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Gagal memuat data user")
      }
    } catch {
      toast.error("Gagal memuat data user")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const saveUser = async (
    formData: UserFormData,
    editingUser: User | null
  ): Promise<boolean> => {
    const url = editingUser ? `/api/platform/users/${editingUser.idUser}` : "/api/platform/users"
    const method = editingUser ? "PUT" : "POST"

    const body: Record<string, string | "user" | "administrator" | "it_support"> = {
      username: formData.username,
      level: formData.level as "user" | "administrator" | "it_support",
      jabatan: formData.jabatan,
    }
    if (formData.password) {
      body.password = formData.password
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      toast.success(editingUser ? "User berhasil diupdate" : "User berhasil dibuat")
      await fetchUsers()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Terjadi kesalahan")
    return false
  }

  const deleteUser = async (user: User): Promise<boolean> => {
    const response = await fetch(`/api/platform/users/${user.idUser}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("User berhasil dihapus")
      await fetchUsers()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Terjadi kesalahan")
    return false
  }

  return { users, loading, fetchUsers, saveUser, deleteUser }
}
