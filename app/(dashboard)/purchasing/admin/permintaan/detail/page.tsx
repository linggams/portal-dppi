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

export default function DetailPermintaanPage() {
  const searchParams = useSearchParams()
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
        `/api/purchasing/permintaan?unit=${encodeURIComponent(unit!)}&tgl_permintaan=${tgl}`
      )
      if (response.ok) {
        const data = await response.json()
        setPermintaan(data)
      }
    } catch {
      toast.error("Failed to load requests")
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
        toast.success("Request approved successfully")
        fetchPermintaan()
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
        toast.success("Request rejected successfully")
        fetchPermintaan()
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

  const pendingItems = permintaan.filter((item) => item.status === 0)

  const handleApproveAll = async () => {
    for (const item of pendingItems) {
      if (item.stokbarang.sisa < item.jumlah) {
        toast.error(
          `Stock for ${item.stokbarang.namaBrg} is insufficient. Available stock: ${item.stokbarang.sisa}`
        )
        return
      }
    }

    setApproveAllDialogOpen(false)
    for (const item of pendingItems) {
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

  const formatDate = (dateString: string) => formatDateId(dateString, dateString)

  if (!unit || !tgl) {
    return (
      <DashboardLayout title="Item request detail">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invalid parameters</p>
          <Button asChild className="mt-4">
            <Link href="/purchasing/admin/permintaan/data">Back</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Item request detail">
      <PageActions>
        <Button variant="outline" asChild>
          <Link href="/purchasing/admin/permintaan/data">Back</Link>
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
        ) : permintaan.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No request data</p>
            <Button asChild className="mt-4">
              <Link href="/purchasing/admin/permintaan/data">Back</Link>
            </Button>
          </div>
        ) : (
          <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Item name</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Available stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                        {getPermintaanItemStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === 0 ? (
                          <TableActions>
                            <TableActionButton label="Approve" icon={Check} onClick={() => handleApproveClick(item)} disabled={processing !== null ||
                                item.stokbarang.sisa < item.jumlah} loading={processing === item.idPermintaan} />
                            <TableActionButton label="Reject" icon={X} variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRejectClick(item)} disabled={processing !== null} loading={processing === item.idPermintaan} />
                          </TableActions>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table></TableContainer>
        )}

        <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve request?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve the request for {permintaanToProcess?.stokbarang.namaBrg}?
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
              <AlertDialogTitle>Reject request?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the request for {permintaanToProcess?.stokbarang.namaBrg}?
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
              <AlertDialogTitle>Approve all requests?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve all of these requests?
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
