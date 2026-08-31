"use client"

import { useCallback, useEffect, useState } from "react"
import { Ban, Pencil } from "lucide-react"
import { DashboardLayout, PageActions, PageSection } from "@/components/layout"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { TablePagination } from "@/components/ui/table-pagination"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import {
  AddKategoriDialog,
  EditKategoriDialog,
  type ItKategoriItem,
} from "./components"

export default function ItKategoriPage() {
  const [kategori, setKategori] = useState<ItKategoriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<ItKategoriItem | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("aktif", "false")
    params.set("page", String(page))
    fetch(`/api/it/kategori?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        const result = readPaginatedJson<ItKategoriItem>(json)
        setKategori(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      })
      .catch(() => {
        setKategori([])
        setTotal(0)
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async (nama: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/it/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      })
      if (!res.ok) throw new Error()
      load()
      toast.success("Kategori ditambahkan")
      return true
    } catch {
      toast.error("Gagal menambah kategori")
      return false
    }
  }

  const handleDeactivate = async (id: number) => {
    try {
      const res = await fetch(`/api/it/kategori/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      load()
      toast.success("Kategori dinonaktifkan")
    } catch {
      toast.error("Gagal menonaktifkan kategori")
    }
  }

  const handleEditClick = (item: ItKategoriItem) => {
    setEditItem(item)
    setEditOpen(true)
  }

  const handleEditSubmit = async (
    id: number,
    data: { nama: string; aktif: boolean }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/it/kategori/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      load()
      toast.success("Kategori diperbarui")
      return true
    } catch {
      toast.error("Gagal memperbarui kategori")
      return false
    }
  }

  return (
    <DashboardLayout title="Kategori Tiket">
      <PageActions>
        <AddKategoriDialog onSubmit={handleAdd} />
      </PageActions>

      <PageSection>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kategori.length === 0 ? (
                    <TableEmptyState colSpan={3} title="Tidak ada kategori" />
                  ) : (
                    kategori.map((k) => (
                      <TableRow key={k.idKategori}>
                        <TableCell>{k.nama}</TableCell>
                        <TableCell>
                          {k.aktif ? (
                            <Badge>Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <TableActions>
                            <TableActionButton
                              label="Edit"
                              icon={Pencil}
                              onClick={() => handleEditClick(k)}
                            />
                            {k.aktif ? (
                              <TableActionButton
                                label="Nonaktifkan"
                                icon={Ban}
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeactivate(k.idKategori)}
                              />
                            ) : null}
                          </TableActions>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="kategori"
            />
          </div>
        )}
      </PageSection>

      <EditKategoriDialog
        item={editItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEditSubmit}
      />
    </DashboardLayout>
  )
}
