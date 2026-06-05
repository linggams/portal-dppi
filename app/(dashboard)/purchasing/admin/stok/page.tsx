"use client"

import { useState, useEffect } from "react"
import { PageActions } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStok } from "./hooks/useStok"
import { StokTable, StokFormDialog, DeleteStokDialog } from "./components"
import type { StokBarang } from "./types"

export default function StokPage() {  const {
    stokBarang,
    jenisBarang,
    loading,
    jenisParam,
    fetchNextKode,
    saveStok,
    deleteStok,
    getJenisName,
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

  if (loading) {
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
            <Button
              onClick={downloadPDF}
              variant="default"
              className="hidden print:hidden"
              disabled={stokBarang.length === 0}
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
              disabled={stokBarang.length === 0}
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
          <div className="hidden text-center print:block print:mb-2">
            <h2 className="text-xl font-bold">PT DASAN PAN PACIFIC INDONESIA</h2>
            <p className="text-sm">
              Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355
            </p>
            <hr className="my-2" />
            <h3 className="text-lg font-bold">
              LAPORAN DATA STOK BARANG {getJenisName(parseInt(jenisParam)).toUpperCase()}
            </h3>
          </div>
          <StokTable
            data={stokBarang}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
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
