"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

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
  }
}

export default function DataPermintaanAdminPage() {
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPermintaan()
  }, [statusFilter])

  const fetchPermintaan = async () => {
    setLoading(true)
    try {
      const url =
        statusFilter === "all"
          ? "/api/purchasing/permintaan"
          : `/api/purchasing/permintaan?status=${statusFilter}`
      const response = await fetch(url)
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline">Pending</Badge>
      case 1:
        return <Badge variant="default">Disetujui</Badge>
      case 2:
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Group by unit and date
  const groupedPermintaan = permintaan.reduce((acc, item) => {
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
  }, {} as Record<string, { unit: string; instansi: string; tglPermintaan: string; items: Permintaan[] }>)

  return (
    <DashboardLayout title="Data Permintaan Barang">
<div className="space-y-6">
        <div className="flex justify-end items-center"><Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">Disetujui</SelectItem>
              <SelectItem value="2">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  {[...Array(2)].map((_, j) => (
                    <Skeleton key={j} className="h-12 w-full" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedPermintaan).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data permintaan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedPermintaan).map((group, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{group.unit}</h2>
                    <p className="text-sm text-muted-foreground">
                      {group.instansi} - {formatDate(group.tglPermintaan)}
                    </p>
                  </div>
                  {group.items.some((item) => item.status === 0) && (
                    <Button asChild>
                      <Link
                        href={`/purchasing/admin/permintaan/detail?unit=${group.unit}&tgl=${group.tglPermintaan.split("T")[0]}`}
                      >
                        Detail & Approve
                      </Link>
                    </Button>
                  )}
                </div>
                <TableContainer>
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((item, idx) => (
                      <TableRow key={item.idPermintaan}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.stokbarang.namaBrg}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{item.stokbarang.satuan}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
