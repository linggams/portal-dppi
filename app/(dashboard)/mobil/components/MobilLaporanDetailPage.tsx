"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout, PageActions, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { formatRupiah } from "@/lib/dana/format"
import type { MobilLaporanKm } from "@/lib/mobil/mobil-types"

export function MobilLaporanDetailPage({
  params,
  backHref,
  title = "Detail Laporan",
}: {
  params: Promise<{ id: string }>
  backHref: string
  title?: string
}) {
  const { id } = use(params)
  const [item, setItem] = useState<MobilLaporanKm | null>(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/mobil/laporan/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Laporan tidak ditemukan")
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setItem(data)
      })
      .catch(() => {
        if (!cancelled) {
          setItem(null)
          toast.error("Laporan tidak ditemukan")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <DashboardLayout title={title}>
      <PageActions>
        <Button variant="outline" asChild>
          <Link href={backHref}>Kembali</Link>
        </Button>
      </PageActions>

      {loading ? (
        <div className="space-y-3 rounded-md border p-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !item ? (
        <p className="text-sm text-muted-foreground">Laporan tidak ditemukan.</p>
      ) : (
        <div className="space-y-4">
          <SectionCard title={`${item.kendaraan?.nopol ?? "—"} · ${item.tanggal}`}>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                Pemohon: <span className="font-medium">{item.username}</span>
                {item.jabatan ? ` · ${item.jabatan}` : ""}
              </p>
              <p>
                Perjalanan:{" "}
                <span className="font-medium">{item.jumlahPerjalanan}</span>
              </p>
              <p>
                KM:{" "}
                <span className="font-medium">
                  {item.kmAwal.toLocaleString("id-ID")} →{" "}
                  {item.kmAkhir.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Pemakaian:{" "}
                <span className="font-medium">
                  {item.pemakaian.toLocaleString("id-ID")} KM
                </span>
              </p>
              <p>
                Total tol:{" "}
                <span className="font-medium">{formatRupiah(item.totalTol)}</span>
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Perjalanan">
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Dari</TableHead>
                    <TableHead>Ke</TableHead>
                    <TableHead className="text-right">KM</TableHead>
                    <TableHead className="text-right">Tol</TableHead>
                    <TableHead className="text-right">Bukti</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {item.perjalanan.length === 0 ? (
                    <TableEmptyState colSpan={6} title="Tidak ada perjalanan" />
                  ) : (
                    item.perjalanan.map((trip) => (
                      <TableRow key={trip.idPerjalanan}>
                        <TableCell>{trip.urutan}</TableCell>
                        <TableCell>{trip.dari}</TableCell>
                        <TableCell>{trip.ke}</TableCell>
                        <TableCell className="text-right">
                          {trip.km.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(trip.tol)}
                        </TableCell>
                        <TableCell className="text-right">
                          {trip.buktiPath ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setPreview(trip.buktiPath)}
                            >
                              Lihat penuh
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </div>
      )}

      {preview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Bukti perjalanan"
            className="max-h-[90vh] max-w-full rounded-md object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}
