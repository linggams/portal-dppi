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
import {
  formatTiketDate,
  getPrioritasBadge,
  getStatusBadge,
} from "@/lib/it/utils"

interface AntrianItem {
  idTiket: number
  nomorTiket: string
  judul: string
  status: number
  prioritas: string
  tglDibuat: string
  kategori: { nama: string }
  posisiAntrian: number | null
  antrianDiDepan: number | null
  totalAntrian: number
}

interface AntrianResponse {
  totalAntrian: number
  antrianSaya: AntrianItem[]
  tiketSelesai: number
}

function formatPosisiAntrian(item: AntrianItem): string {
  if (item.posisiAntrian == null) return "-"
  return `Ke-${item.posisiAntrian} dari ${item.totalAntrian}`
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

          {terdepan?.posisiAntrian != null ? (
            <SectionCard title="Posisi Antrian Terdekat">
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
                  {terdepan.antrianDiDepan != null && terdepan.antrianDiDepan > 0 ? (
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
                  {formatPosisiAntrian(terdepan)}
                </Badge>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Tiket Anda dalam Antrian">
            {antrianSaya.length === 0 ? (
              <ContentEmpty
                title="Tidak ada tiket dalam antrian"
                description="Semua tiket Anda sudah selesai ditangani, atau belum ada tiket yang diajukan"
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Tiket</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Antrian</TableHead>
                      <TableHead>Di Depan</TableHead>
                      <TableHead>Prioritas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {antrianSaya.map((t) => (
                      <TableRow key={t.idTiket}>
                        <TableCell className="font-medium">
                          {t.nomorTiket}
                        </TableCell>
                        <TableCell>{t.judul}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {formatPosisiAntrian(t)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {t.antrianDiDepan != null && t.antrianDiDepan > 0
                            ? `${t.antrianDiDepan} tiket`
                            : "—"}
                        </TableCell>
                        <TableCell>{getPrioritasBadge(t.prioritas)}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell>{formatTiketDate(t.tglDibuat)}</TableCell>
                        <TableCell className="text-right">
                          <TableActionLink
                            label="Detail"
                            icon={Eye}
                            href={`/it/user/tiket/${t.idTiket}`}
                          />
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
            terlama lebih dulu.
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}
