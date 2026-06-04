"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
        <div className="space-y-6">
                    <Card>
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Data User">
      <div className="space-y-6">
        <div className="flex justify-end items-center"><Button onClick={handleAddClick}>Tambah User</Button>
        </div>

        <UserFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editingUser={editingUser}
          onSubmit={saveUser}
        />

        <Card>
          <CardContent>
            <UsersTable
              data={users}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>

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
