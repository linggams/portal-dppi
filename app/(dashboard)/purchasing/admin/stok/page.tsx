"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { PageActions } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TablePagination } from "@/components/ui/table-pagination"
import { useStok } from "./hooks/useStok"
import { StokTable, StokFormDialog, DeleteStokDialog } from "./components"
import type { StokBarang, StokSort } from "./types"

export default function StokPage() {
  const {
    stokBarang,
    jenisBarang,
    loading,
    jenisParam,
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    sort,
    setSort,
    sortDir,
    setSortDir,
    fetchNextKode,
    saveStok,
    deleteStok,
    downloadPDF,
  } = useStok()

  const [formOpen, setFormOpen] = useState(false)
  const [editingStok, setEditingStok] = useState<StokBarang | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [stokToDelete, setStokToDelete] = useState<StokBarang | null>(null)

  const handleAddClick = () => {
    setEditingStok(null)
    setFormOpen(true)
  }

  const handleEditClick = (stok: StokBarang) => {
    setEditingStok(stok)
    setFormOpen(true)
  }

  const handleDeleteClick = (stok: StokBarang) => {
    setStokToDelete(stok)
    setDeleteOpen(true)
  }

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #pdf-stok-content, #pdf-stok-content * { visibility: visible; }
        #pdf-stok-content { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (loading && stokBarang.length === 0 && !sort) {
    return (
      <DashboardLayout title="Data Stok Barang">
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Data Stok Barang">
      <PageActions>
        <div className="mr-auto flex items-center gap-2">
          <Select
            value={sort || "default"}
            onValueChange={(value) =>
              setSort(value === "default" ? "" : (value as StokSort))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Urutkan</SelectItem>
              <SelectItem value="stok">Stok</SelectItem>
              <SelectItem value="keluar">Keluar</SelectItem>
              <SelectItem value="sisa">Sisa</SelectItem>
              <SelectItem value="hargabarang">Harga</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant={sort && sortDir === "asc" ? "default" : "outline"}
            size="icon"
            disabled={!sort}
            aria-label="Urutkan menaik"
            title="Menaik"
            onClick={() => setSortDir("asc")}
          >
            <ArrowUp />
          </Button>
          <Button
            type="button"
            variant={sort && sortDir === "desc" ? "default" : "outline"}
            size="icon"
            disabled={!sort}
            aria-label="Urutkan menurun"
            title="Menurun"
            onClick={() => setSortDir("desc")}
          >
            <ArrowDown />
          </Button>
        </div>
            <Button
              onClick={downloadPDF}
              variant="default"
              className="hidden print:hidden"
              disabled={total === 0}
            >
              Cetak PDF
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="hidden print:hidden"
              disabled={stokBarang.length === 0}
            >
              Cetak
            </Button>
            <Button
              variant="outline"
              onClick={downloadPDF}
              disabled={total === 0}
            >
              Export
            </Button>
            <Button onClick={handleAddClick}>Tambah Stok Barang</Button>
      </PageActions>
      <div className="space-y-6">
        <StokFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          editingStok={editingStok}
          jenisBarang={jenisBarang}
          defaultJenis={parseInt(jenisParam)}
          onSubmit={saveStok}
          onFetchNextKode={fetchNextKode}
        />

        <div id="pdf-stok-content" className="space-y-4 print:space-y-2">
          {loading ? (
            <div className="space-y-3 rounded-md border p-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <StokTable
              data={stokBarang}
              rowOffset={(page - 1) * pageSize}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="barang"
          />
        </div>

        <DeleteStokDialog
          stok={stokToDelete}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={deleteStok}
        />
      </div>
    </DashboardLayout>
  )
}
