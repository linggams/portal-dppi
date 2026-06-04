"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { usePageTitle } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"

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

export default function DetailPermintaanPage() {  const searchParams = useSearchParams()
  const router = useRouter()
  const unit = searchParams.get("unit")
  const tgl = searchParams.get("tgl")

  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approveAllDialogOpen, setApproveAllDialogOpen] = useState(false)
  const [permintaanToProcess, setPermintaanToProcess] = useState<Permintaan | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    if (unit && tgl) {
      fetchPermintaan()
    }
  }, [unit, tgl])

  const fetchPermintaan = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/purchasing/permintaan?unit=${unit}&tgl_permintaan=${tgl}&status=0`
      )
      if (response.ok) {
        const data = await response.json()
        setPermintaan(data)
      }
    } catch {
      toast.error("Gagal memuat data permintaan")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (item: Permintaan) => {
    setPermintaanToProcess(item)
    setApproveDialogOpen(true)
  }

  const handleApprove = async (id: number) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/purchasing/permintaan/${id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Permintaan berhasil disetujui")
        fetchPermintaan()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyetujui")
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectClick = (item: Permintaan) => {
    setPermintaanToProcess(item)
    setRejectDialogOpen(true)
  }

  const handleReject = async (id: number) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/purchasing/permintaan/${id}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Permintaan berhasil ditolak")
        fetchPermintaan()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menolak")
    } finally {
      setProcessing(null)
    }
  }

  const handleApproveAllClick = () => {
    setApproveAllDialogOpen(true)
  }

  const handleApproveAll = async () => {
    // Check if all have sufficient stock
    for (const item of permintaan) {
      if (item.stokbarang.sisa < item.jumlah) {
        toast.error(
          `Stok ${item.stokbarang.namaBrg} tidak mencukupi. Stok tersedia: ${item.stokbarang.sisa}`
        )
        return
      }
    }

    setApproveAllDialogOpen(false)
    // Approve all
    for (const item of permintaan) {
      await handleApprove(item.idPermintaan)
    }
  }

  const handleApproveConfirm = async () => {
    if (permintaanToProcess) {
      setApproveDialogOpen(false)
      await handleApprove(permintaanToProcess.idPermintaan)
      setPermintaanToProcess(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (permintaanToProcess) {
      setRejectDialogOpen(false)
      await handleReject(permintaanToProcess.idPermintaan)
      setPermintaanToProcess(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch {
      return dateString
    }
  }

  if (!unit || !tgl) {
    return (
      <DashboardLayout title="Detail Permintaan Barang">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Parameter tidak valid</p>
          <Button asChild className="mt-4">
            <Link href="/purchasing/admin/permintaan">Kembali</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Detail Permintaan Barang">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/purchasing/admin/permintaan">Kembali</Link>
          </Button>
          {permintaan.length > 0 && (
            <Button onClick={handleApproveAllClick} disabled={processing !== null}>
              {processing !== null ? "Memproses..." : "Setujui Semua"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : permintaan.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data permintaan</p>
            <Button asChild className="mt-4">
              <Link href="/purchasing/admin/permintaan">Kembali</Link>
            </Button>
          </div>
        ) : (
          <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Stok Tersedia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permintaan.map((item, index) => (
                    <TableRow key={item.idPermintaan}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.stokbarang.namaBrg}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>{item.stokbarang.satuan}</TableCell>
                      <TableCell
                        className={
                          item.stokbarang.sisa < item.jumlah
                            ? "text-destructive font-semibold"
                            : ""
                        }
                      >
                        {item.stokbarang.sisa}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TableActions>
                          <TableActionButton label="Setujui" icon={Check} onClick={() => handleApproveClick(item)} disabled={processing !== null ||
                              item.stokbarang.sisa < item.jumlah} loading={processing === item.idPermintaan} />
                          <TableActionButton label="Tolak" icon={X} variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRejectClick(item)} disabled={processing !== null} loading={processing === item.idPermintaan} />
                        </TableActions>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></TableContainer>
        )}

        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Setujui Permintaan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menyetujui permintaan {permintaanToProcess?.stokbarang.namaBrg}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleApproveConfirm}>Ya, Setujui</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tolak Permintaan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menolak permintaan {permintaanToProcess?.stokbarang.namaBrg}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleRejectConfirm} variant="destructive">
                Ya, Tolak
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={approveAllDialogOpen} onOpenChange={setApproveAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Setujui Semua Permintaan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menyetujui semua permintaan ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleApproveAll}>Ya, Setujui Semua</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
