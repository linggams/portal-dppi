"use client"

import { useState, useEffect, useMemo } from "react"
import { Eye } from "lucide-react"
import { PageSection } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
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
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import { TablePagination } from "@/components/ui/table-pagination"
import { DEFAULT_PAGE_SIZE, paginateArray } from "@/lib/shared/pagination"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Permintaan {
  idPermintaan: number
  unit: string
  instansi: string
  kodeBrg: string
  idJenis: number
  jumlah: number
  tglPermintaan: string
  status: number
  stokbarang: {
    namaBrg: string
    satuan: string
    sisa: number
  }
}

type PermintaanGroup = {
  unit: string
  instansi: string
  tglPermintaan: string
  items: Permintaan[]
}

export default function PermintaanPage() {
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchPermintaan()
  }, [])

  const fetchPermintaan = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/purchasing/permintaan?status=0")
      if (response.ok) {
        const data = await response.json()
        const list = Array.isArray(data) ? data : []
        const grouped = list.reduce(
          (acc: Record<string, Permintaan[]>, item: Permintaan) => {
            const key = `${item.unit}-${item.tglPermintaan.split("T")[0]}`
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(item)
            return acc
          },
          {}
        )

        const flattened = Object.values(grouped).flat() as Permintaan[]
        setPermintaan(flattened)
        setPage(1)
      }
    } catch {
      toast.error("Gagal memuat data permintaan")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch {
      return dateString
    }
  }

  const groupedList = useMemo(() => {
    const grouped = permintaan.reduce(
      (acc, item) => {
        const key = `${item.unit}-${item.tglPermintaan.split("T")[0]}`
        if (!acc[key]) {
          acc[key] = {
            unit: item.unit,
            instansi: item.instansi,
            tglPermintaan: item.tglPermintaan,
            items: [],
          }
        }
        acc[key].items.push(item)
        return acc
      },
      {} as Record<string, PermintaanGroup>
    )
    return Object.values(grouped)
  }, [permintaan])

  const paginatedGroups = useMemo(
    () => paginateArray(groupedList, page, DEFAULT_PAGE_SIZE),
    [groupedList, page]
  )

  return (
    <DashboardLayout title="Data Permintaan Barang">
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3 rounded-md border p-6">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-36" />
                </div>
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            ))}
          </div>
        ) : groupedList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada permintaan pending</p>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedGroups.data.map((group, index) => (
              <PageSection
                key={`${group.unit}-${group.tglPermintaan}-${index}`}
                title={group.unit}
                description={`${group.instansi} - ${formatDate(group.tglPermintaan)}`}
                action={
                  <TableActions>
                    <TableActionLink
                      label="Detail Permintaan"
                      icon={Eye}
                      href={`/purchasing/admin/permintaan/detail?unit=${encodeURIComponent(group.unit)}&tgl=${group.tglPermintaan.split("T")[0]}`}
                    />
                  </TableActions>
                }
              >
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead>Stok Tersedia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item, idx) => (
                        <TableRow key={item.idPermintaan}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{item.stokbarang.namaBrg}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{item.stokbarang.satuan}</TableCell>
                          <TableCell>{item.stokbarang.sisa}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </PageSection>
            ))}
            <TablePagination
              page={paginatedGroups.page}
              totalPages={paginatedGroups.totalPages}
              total={paginatedGroups.total}
              pageSize={paginatedGroups.pageSize}
              onPageChange={setPage}
              itemLabel="batch"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
