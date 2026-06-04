"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsers } from "./hooks/useUsers"
import {
  UsersTable,
  UserFormDialog,
  DeleteUserDialog,
} from "./components"
import type { User } from "./types"

export default function UsersPage() {
  const { users, loading, saveUser, deleteUser } = useUsers()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const handleAddClick = () => {
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout title="Data User">
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Data User">
      <div className="space-y-6">
        <PageActions><Button onClick={handleAddClick}>Tambah User</Button>
        </PageActions>

        <UserFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editingUser={editingUser}
          onSubmit={saveUser}
        />

        <UsersTable
          data={users}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        <DeleteUserDialog
          user={userToDelete}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={deleteUser}
        />
      </div>
    </DashboardLayout>
  )
}
