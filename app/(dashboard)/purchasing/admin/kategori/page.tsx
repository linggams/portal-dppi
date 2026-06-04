"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useKategori } from "./hooks/useKategori"
import {
  KategoriTable,
  AddKategoriDialog,
  DeleteKategoriDialog,
} from "./components"
import type { Kategori } from "./types"

export default function KategoriPage() {
  const { kategori, loading, addKategori, deleteKategori } = useKategori()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kategoriToDelete, setKategoriToDelete] = useState<Kategori | null>(null)

  const handleDeleteClick = (item: Kategori) => {
    setKategoriToDelete(item)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout title="Data Kategori">
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
    <DashboardLayout title="Data Kategori">
      <div className="space-y-6">
        <div className="flex justify-end items-center"><AddKategoriDialog onSubmit={addKategori} />
        </div>

        <Card>
          <CardContent>
            <KategoriTable data={kategori} onDelete={handleDeleteClick} />
          </CardContent>
        </Card>

        <DeleteKategoriDialog
          item={kategoriToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={deleteKategori}
        />
      </div>
    </DashboardLayout>
  )
}
