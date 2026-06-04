"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { ContentEmpty, DashboardLayout, PageActions, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { TableActionLink } from "@/components/ui/table-actions"
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
import {
  formatTiketDate,
  getPrioritasBadge,
  getStatusBadge,
} from "@/lib/it/utils"

interface TiketRow {
  idTiket: number
  nomorTiket: string
  judul: string
  username: string
  jabatan: string
  prioritas: string
  status: number
  ditugaskanKe: string | null
  tglDibuat: string
  kategori: { nama: string }
}

export default function ItAntrianPage() {  const [tiket, setTiket] = useState<TiketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  const loadTiket = () => {
    setLoading(true)
    const q =
      statusFilter === "all" ? "" : `?status=${statusFilter}`
    fetch(`/api/it/tiket${q}`)
      .then((r) => r.json())
      .then((data) => setTiket(Array.isArray(data) ? data : []))
      .catch(() => setTiket([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTiket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  return (
    <DashboardLayout title="Antrian Tiket">
      <SectionCard
        title="Daftar Tiket"
        action={
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
        }
      >
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : tiket.length === 0 ? (
          <ContentEmpty title="Tidak ada tiket" />
        ) : (
          <TableContainer>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Tiket</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Prioritas</TableHead>
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
                  <TableCell>{getPrioritasBadge(t.prioritas)}</TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                  <TableCell>{t.ditugaskanKe ?? "-"}</TableCell>
                  <TableCell>{formatTiketDate(t.tglDibuat)}</TableCell>
                  <TableCell className="text-right">
                    <TableActionLink
                      label="Detail"
                      icon={Eye}
                      href={`/it/staff/tiket/${t.idTiket}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </DashboardLayout>
  )
}
