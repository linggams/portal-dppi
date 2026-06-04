"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
import { SearchSelect } from "@/components/ui/search-select"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import { TableActionButton } from "@/components/ui/table-actions"

interface PengajuanSementara {
  idPengajuanSementara: number
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
    satuan: string
  }
}

interface JenisBarang {
  idJenis: number
  jenisBrg: string
}

interface StokBarang {
  idKodeBrg: number
  kodeBrg: string
  idJenis: number
  namaBrg: string
  hargabarang: string
  satuan: string
}

export default function PengajuanPage() {
  const { data: session } = useSession()
  const [jenisBarang, setJenisBarang] = useState<JenisBarang[]>([])
  const [stokBarang, setStokBarang] = useState<StokBarang[]>([])
  const [sementaraList, setSementaraList] = useState<PengajuanSementara[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    idJenis: "",
    kodeBrg: "",
    jumlah: 0,
    satuan: "",
    hargabarang: "",
  })

  useEffect(() => {
    fetchJenisBarang()
  }, [])

  useEffect(() => {
    if (session?.user?.username) {
      fetchSementara()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.username])

  useEffect(() => {
    if (formData.idJenis) {
      fetchStokBarang(parseInt(formData.idJenis))
    }
  }, [formData.idJenis])

  useEffect(() => {
    if (formData.kodeBrg) {
      const selectedStok = stokBarang.find((s) => s.kodeBrg === formData.kodeBrg)
      if (selectedStok) {
        setFormData((prev) => ({
          ...prev,
          satuan: selectedStok.satuan,
          hargabarang: selectedStok.hargabarang,
        }))
      }
    }
  }, [formData.kodeBrg, stokBarang])

  const fetchJenisBarang = async () => {
    try {
      const response = await fetch("/api/purchasing/jenis-barang")
      if (response.ok) {
        const data = await response.json()
        setJenisBarang(data)
      }
    } catch {
      toast.error("Gagal memuat data jenis barang")
    }
  }

  const fetchStokBarang = async (idJenis: number) => {
    try {
      const response = await fetch(`/api/purchasing/stok?id_jenis=${idJenis}`)
      if (response.ok) {
        const data = await response.json()
        setStokBarang(data)
      }
    } catch {
      toast.error("Gagal memuat data stok barang")
    }
  }

  const fetchSementara = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(
        `/api/purchasing/pengajuan/sementara?unit=${session?.user?.username}&tgl_pengajuan=${today}`
      )
      if (response.ok) {
        const data = await response.json()
        setSementaraList(data)
      }
    } catch {
      toast.error("Gagal memuat data pengajuan")
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(num)) return value.toString()
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num)
  }

  const calculateTotal = () => {
    const jumlah = formData.jumlah || 0
    const harga = parseFloat(formData.hargabarang.replace(/[^\d]/g, "")) || 0
    return jumlah * harga
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.idJenis ||
      !formData.kodeBrg ||
      !formData.jumlah ||
      formData.jumlah <= 0 ||
      !formData.satuan ||
      !formData.hargabarang
    ) {
      toast.error("Mohon lengkapi semua field")
      return
    }

    const harga = parseFloat(formData.hargabarang.replace(/[^\d]/g, ""))
    const total = calculateTotal()

    try {
      const response = await fetch("/api/purchasing/pengajuan/sementara", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unit: session?.user?.username,
          kodeBrg: formData.kodeBrg,
          idJenis: parseInt(formData.idJenis),
          jumlah: formData.jumlah,
          satuan: formData.satuan,
          hargabarang: harga,
          total: total,
        }),
      })

      if (response.ok) {
        toast.success("Barang ditambahkan ke pengajuan")
        setFormData({
          idJenis: "",
          kodeBrg: "",
          jumlah: 0,
          satuan: "",
          hargabarang: "",
        })
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menambahkan")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/purchasing/pengajuan/sementara?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Barang dihapus dari pengajuan")
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus")
    }
  }

  const handleSubmitClick = () => {
    if (sementaraList.length === 0) {
      toast.error("Tidak ada pengajuan untuk disubmit")
      return
    }
    setSubmitDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitDialogOpen(false)
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch("/api/purchasing/pengajuan/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unit: session?.user?.username,
          tglPengajuan: today,
        }),
      })

      if (response.ok) {
        toast.success("Pengajuan berhasil dikirim")
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengirim pengajuan")
    } finally {
      setSubmitting(false)
    }
  }

  const totalAll = sementaraList.reduce((sum, item) => sum + item.total, 0)
  const jumlahAll = sementaraList.reduce((sum, item) => sum + item.jumlah, 0)

  return (
    <DashboardLayout title="Pengajuan Barang">
<div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Tambah Barang</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="idJenis">Jenis Barang</Label>
                <SearchSelect
                  value={formData.idJenis}
                  onSelect={(item) =>
                    setFormData({
                      idJenis: item.value,
                      kodeBrg: "",
                      jumlah: 0,
                      satuan: "",
                      hargabarang: "",
                    })
                  }
                  placeholder="Pilih Jenis Barang"
                  items={jenisBarang.map((jenis) => ({
                    id: String(jenis.idJenis),
                    value: String(jenis.idJenis),
                    label: jenis.jenisBrg,
                  }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kodeBrg">Nama Barang</Label>
                <SearchSelect
                  value={formData.kodeBrg}
                  onSelect={(item) =>
                    setFormData({ ...formData, kodeBrg: item.value })
                  }
                  placeholder="Pilih Nama Barang"
                  disabled={!formData.idJenis}
                  items={stokBarang.map((stok) => ({
                    id: stok.kodeBrg,
                    value: stok.kodeBrg,
                    label: stok.namaBrg,
                    searchableText: `${stok.namaBrg} ${stok.kodeBrg}`,
                  }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="satuan">Satuan</Label>
                <Input
                  id="satuan"
                  value={formData.satuan}
                  onChange={(e) =>
                    setFormData({ ...formData, satuan: e.target.value })
                  }
                  required
                  placeholder="Contoh: PCE, RIM, PACK"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hargabarang">Harga Barang</Label>
                <Input
                  id="hargabarang"
                  type="text"
                  value={formData.hargabarang}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "")
                    setFormData({ ...formData, hargabarang: value })
                  }}
                  required
                  placeholder="Contoh: 50000"
                />
                {formData.hargabarang && (
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(formData.hargabarang)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  id="jumlah"
                  type="number"
                  value={formData.jumlah || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jumlah: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min="1"
                />
              </div>

              {formData.jumlah > 0 && formData.hargabarang && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-semibold">
                    Total: {formatRupiah(calculateTotal())}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Tambah ke Pengajuan
              </Button>
            </form>
          </Card>

          {/* List Sementara */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Pengajuan Hari Ini</h2>
              {sementaraList.length > 0 && (
                <Button onClick={handleSubmitClick} disabled={submitting} size="sm">
                  {submitting ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sementaraList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada pengajuan barang hari ini
              </p>
            ) : (
              <div className="space-y-2">
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sementaraList.map((item) => (
                        <TableRow key={item.idPengajuanSementara}>
                          <TableCell>{item.stokbarang.namaBrg}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{item.satuan}</TableCell>
                          <TableCell>{formatRupiah(item.hargabarang)}</TableCell>
                          <TableCell>{formatRupiah(item.total)}</TableCell>
                          <TableCell className="text-right">
                            <TableActionButton
                              label="Hapus"
                              icon={Trash2}
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleDelete(item.idPengajuanSementara)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <div className="flex justify-between">
                    <span className="font-semibold">Jumlah Barang:</span>
                    <span>{jumlahAll}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="font-semibold">Sub Total:</span>
                    <span className="font-bold">
                      {formatRupiah(totalAll)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim Pengajuan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim pengajuan ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Kirim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
