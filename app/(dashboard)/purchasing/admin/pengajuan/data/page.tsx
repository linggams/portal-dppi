"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
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
import { SearchSelect } from "@/components/ui/search-select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import { downloadPdf } from "@/lib/makepdf"

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

export default function DataPengajuanPage() {
  const [pengajuan, setPengajuan] = useState<Pengajuan[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPengajuan()
  }, [statusFilter])

  const fetchPengajuan = async () => {
    setLoading(true)
    try {
      const url =
        statusFilter === "all"
          ? "/api/purchasing/pengajuan"
          : `/api/purchasing/pengajuan?status=${statusFilter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPengajuan(data)
      }
    } catch {
      toast.error("Gagal memuat data pengajuan")
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

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
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

  const handleDownloadPDF = async (unit: string, tglPengajuan: string) => {
    try {
      const response = await fetch(
        `/api/purchasing/pengajuan?unit=${unit}&tgl_pengajuan=${tglPengajuan.split("T")[0]}`
      )
      if (!response.ok) {
        throw new Error("Gagal memuat data pengajuan")
      }
      const data = await response.json()
      
      if (data.length === 0) {
        toast.error("Tidak ada data untuk dicetak")
        return
      }

      const filename = `Pengajuan_${unit}_${tglPengajuan.split("T")[0]}.pdf`

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any[] = [
        [
          { text: "No.", style: "tableHeader" },
          { text: "Kode Barang", style: "tableHeader" },
          { text: "Nama Barang", style: "tableHeader" },
          { text: "Satuan", style: "tableHeader" },
          { text: "Jumlah", style: "tableHeader" },
          { text: "Harga Barang", style: "tableHeader" },
          { text: "Total", style: "tableHeader" },
        ],
        ...data.map((item: Pengajuan, index: number) => [
          { text: String(index + 1), alignment: "center" },
          { text: item.kodeBrg, alignment: "center" },
          { text: item.stokbarang.namaBrg },
          { text: item.satuan, alignment: "center" },
          { text: String(item.jumlah), alignment: "center" },
          { text: formatRupiah(item.hargabarang), alignment: "right" },
          { text: formatRupiah(item.total), alignment: "right" },
        ]),
      ]

      const subtotalJumlah = data.reduce((sum: number, item: Pengajuan) => sum + item.jumlah, 0)
      const subtotalHarga = data.reduce((sum: number, item: Pengajuan) => sum + item.hargabarang, 0)
      const subtotalTotal = data.reduce((sum: number, item: Pengajuan) => sum + item.total, 0)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [40, 60, 40, 40],
        content: [
          { text: "PT DASAN PAN PACIFIC INDONESIA", style: "header", alignment: "center" },
          {
            text: "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355",
            style: "subheader",
            alignment: "center",
            margin: [0, 4, 0, 8],
          },
          {
            canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
            margin: [0, 0, 0, 8],
          },
          { text: "FORM PENGAJUAN BARANG", style: "title", alignment: "center", decoration: "underline", margin: [0, 0, 0, 10] },
          { text: "Permintaan Pembelian Barang", style: "meta" },
          { text: [{ text: "Pada Tanggal : ", style: "meta" }, { text: formatDate(tglPengajuan), style: "metaBold" }], margin: [0, 0, 0, 10] },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "auto", "*", "auto", "auto", "auto", "auto"],
              body,
            },
            layout: "lightHorizontalLines",
          },
          {
            table: {
              headerRows: 0,
              widths: ["*", "auto", "auto", "auto"],
              body: [
                [
                  { text: "Sub Total", style: "subtotalLabel", alignment: "center" },
                  { text: String(subtotalJumlah), style: "subtotalValue", alignment: "center" },
                  { text: formatRupiah(subtotalHarga), style: "subtotalValue", alignment: "center" },
                  { text: formatRupiah(subtotalTotal), style: "subtotalValue", alignment: "center" },
                ],
              ],
            },
            margin: [0, 10, 0, 0],
          },
        ],
        styles: {
          header: { fontSize: 14, bold: true },
          subheader: { fontSize: 9 },
          title: { fontSize: 12, bold: true },
          meta: { fontSize: 10 },
          metaBold: { fontSize: 10, bold: true },
          tableHeader: { bold: true, fontSize: 9, fillColor: "#f3f4f6", alignment: "center" },
          subtotalLabel: { bold: true, fillColor: "#f3f4f6", fontSize: 10 },
          subtotalValue: { bold: true, fontSize: 10 },
        },
        defaultStyle: { fontSize: 9 },
      }

      downloadPdf(docDefinition, filename)
      toast.success("PDF berhasil diunduh")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Gagal mengunduh PDF")
    }
  }

  // Group by unit and date
  const groupedPengajuan = pengajuan.reduce((acc, item) => {
    const key = `${item.unit}-${item.tglPengajuan.split("T")[0]}`
    if (!acc[key]) {
      acc[key] = {
        unit: item.unit,
        tglPengajuan: item.tglPengajuan,
        items: [],
      }
    }
    acc[key].items.push(item)
    return acc
  }, {} as Record<string, { unit: string; tglPengajuan: string; items: Pengajuan[] }>)

  return (
    <DashboardLayout title="Data Pengajuan Barang">
<div className="space-y-6">
        <div className="flex justify-between items-center gap-4 flex-wrap">
                    <SearchSelect
            value={statusFilter}
            onSelect={(item) => setStatusFilter(item.value)}
            placeholder="Filter Status"
            size="sm"
            items={[
              { id: "all", value: "all", label: "Semua Status" },
              { id: "0", value: "0", label: "Pending" },
              { id: "1", value: "1", label: "Disetujui" },
              { id: "2", value: "2", label: "Ditolak" },
            ]}
          />
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
        ) : Object.keys(groupedPengajuan).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data pengajuan</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedPengajuan).map((group, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{group.unit}</h2>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(group.tglPengajuan)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {group.items.some((item) => item.status === 0) && (
                      <Button asChild>
                        <Link
                          href={`/purchasing/admin/pengajuan/detail?unit=${group.unit}&tgl=${group.tglPengajuan.split("T")[0]}`}
                        >
                          Detail & Approve
                        </Link>
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDownloadPDF(group.unit, group.tglPengajuan)}
                      variant="default"
                      className="hidden print:hidden"
                    >
                      Cetak PDF
                    </Button>
                  </div>
                </div>
                <div className="text-center mb-4 pb-4 border-b">
                  <h2 className="text-lg font-bold text-foreground">PT DASAN PAN PACIFIC INDONESIA</h2>
                  <p className="text-sm text-muted-foreground">Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355</p>
                </div>
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.items.map((item, idx) => (
                        <TableRow key={item.idPengajuan}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{item.stokbarang.namaBrg}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{item.satuan}</TableCell>
                          <TableCell>{formatRupiah(item.hargabarang)}</TableCell>
                          <TableCell>{formatRupiah(item.total)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Pengajuan:</span>
                    <span>
                      {formatRupiah(
                        group.items.reduce((sum, item) => sum + item.total, 0)
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
