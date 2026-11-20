"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PageActions } from "@/components/layout"
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
import { Skeleton } from "@/components/ui/skeleton"
import { getPermintaanItemStatusBadge } from "@/lib/purchasing/permintaan-status"
import { toast } from "sonner"
import { formatDateId } from "@/lib/shared/date"
import Link from "next/link"
import { Check, X } from "lucide-react"
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

interface Pengajuan {
  idPengajuan: number
  unit: string
  kodeBrg: string
  idJenis: number
  jumlah: number
  satuan: string
  hargabarang: number
  total: number
  tglPengajuan: string
  status: number
  stokbarang: {
    namaBrg: string
  }
}

export default function DetailPengajuanPage() {
  const searchParams = useSearchParams()
  const unit = searchParams.get("unit")
  const tgl = searchParams.get("tgl")

  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approveAllDialogOpen, setApproveAllDialogOpen] = useState(false)
  const [pengajuanToProcess, setPengajuanToProcess] = useState<Pengajuan | null>(null)

  useEffect(() => {
    if (unit && tgl) {
      fetchPengajuan()
    }
  }, [unit, tgl])

  const fetchPengajuan = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/purchasing/pengajuan?unit=${encodeURIComponent(unit!)}&tgl_pengajuan=${tgl}`
      )
      if (response.ok) {
        const data = await response.json()
        setPengajuan(data)
      }
    } catch {
      toast.error("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (item: Pengajuan) => {
    setPengajuanToProcess(item)
    setApproveDialogOpen(true)
  }

  const handleApprove = async (id: number) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/purchasing/pengajuan/${id}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Submission approved successfully")
        fetchPengajuan()
      } else {
        const error = await response.json()
        toast.error(error.error || "An error occurred")
      }
    } catch {
      toast.error("An error occurred while approving")
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectClick = (item: Pengajuan) => {
    setPengajuanToProcess(item)
    setRejectDialogOpen(true)
  }

  const handleReject = async (id: number) => {
    setProcessing(id)
    try {
      const response = await fetch(`/api/purchasing/pengajuan/${id}/reject`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Submission rejected successfully")
        fetchPengajuan()
      } else {
        const error = await response.json()
        toast.error(error.error || "An error occurred")
      }
    } catch {
      toast.error("An error occurred while rejecting")
    } finally {
      setProcessing(null)
    }
  }

  const handleApproveAllClick = () => {
    setApproveAllDialogOpen(true)
  }

  const pendingItems = pengajuan.filter((item) => item.status === 0)

  const handleApproveAll = async () => {
    setApproveAllDialogOpen(false)
    for (const item of pendingItems) {
      await handleApprove(item.idPengajuan)
    }
  }

  const handleApproveConfirm = async () => {
    if (pengajuanToProcess) {
      setApproveDialogOpen(false)
      await handleApprove(pengajuanToProcess.idPengajuan)
      setPengajuanToProcess(null)
    }
  }

  const handleRejectConfirm = async () => {
    if (pengajuanToProcess) {
      setRejectDialogOpen(false)
      await handleReject(pengajuanToProcess.idPengajuan)
      setPengajuanToProcess(null)
    }
  }

  const formatDate = (dateString: string) => formatDateId(dateString, dateString)

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const totalAll = pengajuan.reduce((sum, item) => sum + item.total, 0)

  if (!unit || !tgl) {
    return (
      <DashboardLayout title="Submission detail">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invalid parameters</p>
          <Button asChild className="mt-4">
            <Link href="/purchasing/admin/pengajuan/data">Back</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Submission detail">
      <PageActions>
        <Button variant="outline" asChild>
          <Link href="/purchasing/admin/pengajuan/data">Back</Link>
        </Button>
        {pendingItems.length > 0 ? (
          <Button
            onClick={handleApproveAllClick}
            disabled={processing !== null}
          >
            {processing !== null ? "Processing..." : "Approve all"}
          </Button>
        ) : null}
      </PageActions>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : pengajuan.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No submission data</p>
            <Button asChild className="mt-4">
              <Link href="/purchasing/admin/pengajuan/data">Back</Link>
            </Button>
          </div>
        ) : (
          <>
            <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Item name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pengajuan.map((item, index) => (
                      <TableRow key={item.idPengajuan}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.stokbarang.namaBrg}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{item.satuan}</TableCell>
                        <TableCell>{formatRupiah(item.hargabarang)}</TableCell>
                        <TableCell>{formatRupiah(item.total)}</TableCell>
                        <TableCell>
                          {getPermintaanItemStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === 0 ? (
                            <TableActions>
                              <TableActionButton label="Approve" icon={Check} onClick={() => handleApproveClick(item)} disabled={processing !== null} loading={processing === item.idPengajuan} />
                              <TableActionButton label="Reject" icon={X} variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRejectClick(item)} disabled={processing !== null} loading={processing === item.idPengajuan} />
                            </TableActions>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table></TableContainer>
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="flex justify-between text-lg font-semibold text-foreground">
                <span>Submission total:</span>
                <span>{formatRupiah(totalAll)}</span>
              </div>
            </div>
          </>
        )}

        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve submission?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve the submission for {pengajuanToProcess?.stokbarang.namaBrg}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApproveConfirm}>Yes, approve</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject submission?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the submission for {pengajuanToProcess?.stokbarang.namaBrg}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRejectConfirm} variant="destructive">
                Yes, reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={approveAllDialogOpen} onOpenChange={setApproveAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve all submissions?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve all of these submissions?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApproveAll}>Yes, approve all</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
