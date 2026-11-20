"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { User, UserFormData } from "../types"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      const response = await fetch(`/api/platform/users?${params.toString()}`)
      if (response.ok) {
        const result = readPaginatedJson<User>(await response.json())
        setUsers(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      } else {
        toast.error("Failed to load users")
      }
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const saveUser = async (
    formData: UserFormData,
    editingUser: User | null
  ): Promise<boolean> => {
    const url = editingUser
      ? `/api/platform/users/${editingUser.idUser}`
      : "/api/platform/users"
    const method = editingUser ? "PUT" : "POST"

    const body: Record<string, string | number | boolean | object> = {
      username: formData.username,
      roleId: Number(formData.roleId),
      jabatan: formData.jabatan,
      modules: formData.modules,
      accessModules: formData.accessModules,
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
      toast.success(editingUser ? "User updated" : "User created")
      await fetchUsers()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Something went wrong")
    return false
  }

  const deleteUser = async (user: User): Promise<boolean> => {
    const response = await fetch(`/api/platform/users/${user.idUser}`, {
      method: "DELETE",
    })

    if (response.ok) {
      toast.success("User deleted")
      await fetchUsers()
      return true
    }

    const error = await response.json()
    toast.error(error.error || "Something went wrong")
    return false
  }

  return {
    users,
    loading,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    fetchUsers,
    saveUser,
    deleteUser,
  }
}
