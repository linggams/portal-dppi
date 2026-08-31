"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import {
  ContentEmpty,
  DashboardLayout,
  PageActions,
  PageSection,
} from "@/components/layout"
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import { TablePagination } from "@/components/ui/table-pagination"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
import { formatTiketDate, getStatusBadge } from "@/lib/it/utils"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"

interface TiketRow {
  idTiket: number
  nomorTiket: string
  judul: string
  username: string
  jabatan: string
  status: number
  ditugaskanKe: string | null
  tglDibuat: string
  kategori: { nama: string }
}

export default function ItAntrianPage() {
  const [tiket, setTiket] = useState<TiketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== "all") params.set("status", statusFilter)
    params.set("page", String(page))
    fetch(`/api/it/tiket?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        const result = readPaginatedJson<TiketRow>(json)
        setTiket(result.data)
        setTotal(result.total)
        setTotalPages(result.totalPages)
        setPageSize(result.pageSize)
      })
      .catch(() => {
        setTiket([])
        setTotal(0)
        setTotalPages(1)
      })
      .finally(() => setLoading(false))
  }, [statusFilter, page])

  return (
    <DashboardLayout title="Antrian Tiket">
      <PageActions>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {Object.entries(IT_TIKET_STATUS_LABEL).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageActions>

      <PageSection>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : tiket.length === 0 ? (
          <ContentEmpty title="Tidak ada tiket" />
        ) : (
          <div className="space-y-4">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Tiket</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ditugaskan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tiket.map((t) => (
                    <TableRow key={t.idTiket}>
                      <TableCell className="font-medium">{t.nomorTiket}</TableCell>
                      <TableCell>{t.judul}</TableCell>
                      <TableCell>
                        {t.username}
                        <span className="block text-xs text-muted-foreground">
                          {t.jabatan}
                        </span>
                      </TableCell>
                      <TableCell>{t.kategori.nama}</TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell>{t.ditugaskanKe ?? "-"}</TableCell>
                      <TableCell>{formatTiketDate(t.tglDibuat)}</TableCell>
                      <TableCell className="text-right">
                        <TableActions>
                          <TableActionLink
                            label="Detail"
                            icon={Eye}
                            href={`/it/staff/tiket/${t.idTiket}`}
                          />
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              itemLabel="tiket"
            />
          </div>
        )}
      </PageSection>
    </DashboardLayout>
  )
}
