"use client"

import { useState } from "react"
import { PageActions } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/ui/table-pagination"
import { useKategori } from "./hooks/useKategori"
import {
  KategoriTable,
  AddKategoriDialog,
  DeleteKategoriDialog,
} from "./components"
import type { Kategori } from "./types"

export default function KategoriPage() {
  const {
    kategori,
    loading,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    addKategori,
    deleteKategori,
  } = useKategori()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kategoriToDelete, setKategoriToDelete] = useState<Kategori | null>(null)

  const handleDeleteClick = (item: Kategori) => {
    setKategoriToDelete(item)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout title="Data Kategori">
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
    <DashboardLayout title="Data Kategori">
      <PageActions>
        <AddKategoriDialog onSubmit={addKategori} />
      </PageActions>

      <div className="space-y-6">
        <div className="space-y-4">
          <KategoriTable data={kategori} onDelete={handleDeleteClick} />
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="kategori"
          />
        </div>

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
