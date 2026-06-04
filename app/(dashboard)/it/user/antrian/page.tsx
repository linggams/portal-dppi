"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, Inbox } from "lucide-react"
import {
  ContentEmpty,
  DashboardLayout,
  PageActions,
  SectionCard,
  StatCard,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TableActionLink } from "@/components/ui/table-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { cn } from "@/lib/utils"
import {
  formatTiketDate,
  getPrioritasBadge,
  getStatusBadge,
} from "@/lib/it/utils"

interface AntrianItem {
  idTiket: number
  nomorTiket: string
  username: string
  judul: string
  status: number
  prioritas: string
  tglDibuat: string
  kategori: { nama: string }
  posisiAntrian: number
  antrianDiDepan: number
  totalAntrian: number
  isMine: boolean
}

interface AntrianResponse {
  totalAntrian: number
  antrianGlobal: AntrianItem[]
  antrianSaya: AntrianItem[]
  tiketSelesai: number
}

export default function UserAntrianPage() {
  const [data, setData] = useState<AntrianResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/it/tiket/antrian")
      .then(async (r) => {
        if (!r.ok) return null
        const ct = r.headers.get("content-type") ?? ""
        if (!ct.includes("application/json")) return null
        return r.json()
      })
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const antrianGlobal = data?.antrianGlobal ?? []
  const antrianSaya = data?.antrianSaya ?? []
  const terdepan = antrianSaya[0]

  return (
    <DashboardLayout title="Antrian Tiket">
      <PageActions>
        <Button asChild variant="outline">
          <Link href="/it/user/tiket">Tiket Saya</Link>
        </Button>
        <Button asChild>
          <Link href="/it/user/tiket/buat">Ajukan Tiket</Link>
        </Button>
      </PageActions>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total Antrian IT"
              value={data?.totalAntrian ?? 0}
            />
            <StatCard
              label="Tiket Anda Dalam Antrian"
              value={antrianSaya.length}
            />
            <StatCard
              label="Tiket Anda Selesai"
              value={data?.tiketSelesai ?? 0}
            />
          </div>

          {terdepan ? (
            <SectionCard title="Posisi Antrian Terdekat (Tiket Anda)">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {terdepan.nomorTiket} — {terdepan.judul}
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    Antrian ke-{terdepan.posisiAntrian}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      dari {terdepan.totalAntrian} tiket
                    </span>
                  </p>
                  {terdepan.antrianDiDepan > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ada {terdepan.antrianDiDepan} tiket di depan Anda
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-500">
                      Tiket Anda berada di urutan terdepan antrian
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="w-fit gap-1">
                  <Inbox className="size-3.5" />
                  Ke-{terdepan.posisiAntrian}/{terdepan.totalAntrian}
                </Badge>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Antrian Tiket (Semua)">
            {antrianGlobal.length === 0 ? (
              <ContentEmpty
                title="Antrian kosong"
                description="Belum ada tiket yang menunggu penanganan tim IT"
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>No. Tiket</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {antrianGlobal.map((t) => (
                      <TableRow
                        key={t.idTiket}
                        className={cn(
                          t.isMine &&
                            "bg-primary/5 border-l-2 border-l-primary"
                        )}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {t.posisiAntrian}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className="flex flex-wrap items-center gap-2">
                            {t.nomorTiket}
                            {t.isMine ? (
                              <Badge variant="default" className="text-[10px]">
                                Anda
                              </Badge>
                            ) : null}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {t.judul}
                        </TableCell>
                        <TableCell>{t.username}</TableCell>
                        <TableCell>{t.kategori.nama}</TableCell>
                        <TableCell>{getPrioritasBadge(t.prioritas)}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatTiketDate(t.tglDibuat)}
                        </TableCell>
                        <TableCell className="text-right">
                          {t.isMine ? (
                            <TableActionLink
                              label="Detail"
                              icon={Eye}
                              href={`/it/user/tiket/${t.idTiket}`}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>

          <p className="text-xs text-muted-foreground">
            Urutan antrian: prioritas (Kritis → Rendah), lalu tanggal pengajuan
            terlama lebih dulu. Baris dengan label &quot;Anda&quot; adalah tiket
            milik Anda; detail hanya dapat dibuka untuk tiket sendiri.
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}
