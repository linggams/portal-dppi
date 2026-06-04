"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PageSection } from "@/components/layout"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2 } from "lucide-react"
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

interface Sementara {
  idSementara: number
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
  sisa: number
}

export default function PermintaanPage() {
  const { data: session } = useSession()
  const [jenisBarang, setJenisBarang] = useState<JenisBarang[]>([])
  const [stokBarang, setStokBarang] = useState<StokBarang[]>([])
  const [sementaraList, setSementaraList] = useState<Sementara[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    idJenis: "",
    kodeBrg: "",
    jumlah: 0,
  })

  useEffect(() => {
    fetchJenisBarang()
    fetchSementara()
  }, [])

  useEffect(() => {
    if (formData.idJenis) {
      fetchStokBarang(parseInt(formData.idJenis))
    }
  }, [formData.idJenis])

  const fetchJenisBarang = async () => {
    try {
      const response = await fetch("/api/purchasing/jenis-barang")
      if (response.ok) {
        const data = await response.json()
        setJenisBarang(data)
      }
    } catch (error) {
      toast.error("Gagal memuat data jenis barang")
    }
  }

  const fetchStokBarang = async (idJenis: number) => {
    try {
      const response = await fetch(`/api/purchasing/stok?id_jenis=${idJenis}`)
      if (response.ok) {
        const data = await response.json()
        setStokBarang(data.filter((item: StokBarang) => item.sisa > 0))
      }
    } catch (error) {
      toast.error("Gagal memuat data stok barang")
    }
  }

  const fetchSementara = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(
        `/api/purchasing/permintaan/sementara?unit=${session?.user?.username}&tgl_permintaan=${today}`
      )
      if (response.ok) {
        const data = await response.json()
        setSementaraList(data)
      }
    } catch (error) {
      toast.error("Gagal memuat data permintaan")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.idJenis || !formData.kodeBrg || !formData.jumlah || formData.jumlah <= 0) {
      toast.error("Mohon lengkapi semua field")
      return
    }

    const selectedStok = stokBarang.find((s) => s.kodeBrg === formData.kodeBrg)
    if (!selectedStok) {
      toast.error("Barang tidak ditemukan")
      return
    }

    if (selectedStok.sisa < formData.jumlah) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${selectedStok.sisa}`)
      return
    }

    try {
      const response = await fetch("/api/purchasing/permintaan/sementara", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unit: session?.user?.username,
          instansi: session?.user?.jabatan,
          kodeBrg: formData.kodeBrg,
          idJenis: parseInt(formData.idJenis),
          jumlah: formData.jumlah,
        }),
      })

      if (response.ok) {
        toast.success("Barang ditambahkan ke permintaan")
        setFormData({ idJenis: "", kodeBrg: "", jumlah: 0 })
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menambahkan")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/purchasing/permintaan/sementara?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Barang dihapus dari permintaan")
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus")
    }
  }

  const handleSubmitClick = () => {
    if (sementaraList.length === 0) {
      toast.error("Tidak ada permintaan untuk disubmit")
      return
    }
    setSubmitDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitDialogOpen(false)
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch("/api/purchasing/permintaan/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unit: session?.user?.username,
          instansi: session?.user?.jabatan,
          tglPermintaan: today,
        }),
      })

      if (response.ok) {
        toast.success("Permintaan berhasil dikirim")
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Terjadi kesalahan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim permintaan")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStok = stokBarang.find((s) => s.kodeBrg === formData.kodeBrg)

  return (
    <DashboardLayout title="Permintaan Barang">
<div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Tambah Barang</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="idJenis">Jenis Barang</Label>
                <Select
                  value={formData.idJenis}
                  onValueChange={(value) => {
                    setFormData({ idJenis: value, kodeBrg: "", jumlah: 0 })
                  }}
                  required
                >
                  <SelectTrigger id="idJenis">
                    <SelectValue placeholder="Pilih Jenis Barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisBarang.map((jenis) => (
                      <SelectItem key={jenis.idJenis} value={String(jenis.idJenis)}>
                        {jenis.jenisBrg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kodeBrg">Nama Barang</Label>
                <Select
                  value={formData.kodeBrg}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kodeBrg: value })
                  }
                  required
                  disabled={!formData.idJenis}
                >
                  <SelectTrigger id="kodeBrg">
                    <SelectValue placeholder="Pilih Nama Barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {stokBarang.map((stok) => (
                      <SelectItem key={stok.kodeBrg} value={stok.kodeBrg}>
                        {stok.namaBrg} (Sisa: {stok.sisa} {stok.satuan})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStok && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Stok Tersedia: <span className="font-semibold text-foreground">{selectedStok.sisa} {selectedStok.satuan}</span>
                  </p>
                </div>
              )}

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
                  max={selectedStok?.sisa || 0}
                />
              </div>

              <Button type="submit" className="w-full">
                Tambah ke Permintaan
              </Button>
            </form>
          </Card>

          <PageSection
            title="Permintaan Hari Ini"
            action={
              sementaraList.length > 0 ? (
                <Button
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  size="sm"
                >
                  {submitting ? "Mengirim..." : "Kirim Permintaan"}
                </Button>
              ) : undefined
            }
          >
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : sementaraList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada permintaan barang hari ini
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
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sementaraList.map((item) => (
                        <TableRow key={item.idSementara}>
                          <TableCell>{item.stokbarang.namaBrg}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{item.stokbarang.satuan}</TableCell>
                          <TableCell className="text-right">
                            <TableActionButton
                              label="Hapus"
                              icon={Trash2}
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.idSementara)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table></TableContainer>
              </div>
            )}
          </PageSection>
        </div>
      </div>

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim Permintaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim permintaan ini?
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
