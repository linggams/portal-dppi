"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PageSection, PageActions } from "@/components/layout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { TableActionButton, TableActions } from "@/components/ui/table-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MAX_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import {
  getTodayDateWIB,
  PERMINTAAN_DAILY_LIMIT_MESSAGE,
  type PermintaanDailyLimitStatus,
} from "@/lib/purchasing/permintaan-daily-limit-types"

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
  const [dailyLimit, setDailyLimit] = useState<PermintaanDailyLimitStatus | null>(
    null
  )
  const [formData, setFormData] = useState({
    idJenis: "",
    kodeBrg: "",
    jumlah: 0,
  })

  useEffect(() => {
    if (!session?.user?.username) return
    fetchJenisBarang()
    fetchDailyLimit()
    fetchSementara()
  }, [session?.user?.username])

  const fetchDailyLimit = async () => {
    try {
      const response = await fetch(
        `/api/purchasing/permintaan/daily-limit?unit=${session?.user?.username}`
      )
      if (response.ok) {
        const data: PermintaanDailyLimitStatus = await response.json()
        setDailyLimit(data)
      }
    } catch {
      toast.error("Failed to load daily request status")
    }
  }

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
      toast.error("Failed to load item types")
    }
  }

  const fetchStokBarang = async (idJenis: number) => {
    try {
      const params = new URLSearchParams()
      params.set("id_jenis", String(idJenis))
      params.set("page", "1")
      params.set("page_size", String(MAX_PAGE_SIZE))
      const response = await fetch(`/api/purchasing/stok?${params.toString()}`)
      if (response.ok) {
        const result = readPaginatedJson<StokBarang>(await response.json())
        setStokBarang(result.data.filter((item) => item.sisa > 0))
      }
    } catch (error) {
      toast.error("Failed to load stock data")
    }
  }

  const fetchSementara = async () => {
    setLoading(true)
    try {
      const today = getTodayDateWIB()
      const response = await fetch(
        `/api/purchasing/permintaan/sementara?unit=${session?.user?.username}&tgl_permintaan=${today}`
      )
      if (response.ok) {
        const data = await response.json()
        setSementaraList(data)
      }
    } catch (error) {
      toast.error("Failed to load request data")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (dailyLimit?.alreadySubmitted) {
      toast.error(PERMINTAAN_DAILY_LIMIT_MESSAGE)
      return
    }

    if (!formData.idJenis || !formData.kodeBrg || !formData.jumlah || formData.jumlah <= 0) {
      toast.error("Please complete all fields")
      return
    }

    const selectedStok = stokBarang.find((s) => s.kodeBrg === formData.kodeBrg)
    if (!selectedStok) {
      toast.error("Item not found")
      return
    }

    if (selectedStok.sisa < formData.jumlah) {
      toast.error(`Insufficient stock. Available stock: ${selectedStok.sisa}`)
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
        toast.success("Item added to request")
        setFormData({ idJenis: "", kodeBrg: "", jumlah: 0 })
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong while adding")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/purchasing/permintaan/sementara?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Item removed from request")
        fetchSementara()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong while deleting")
    }
  }

  const handleSubmitClick = () => {
    if (dailyLimit?.alreadySubmitted) {
      toast.error(PERMINTAAN_DAILY_LIMIT_MESSAGE)
      return
    }

    if (sementaraList.length === 0) {
      toast.error("No requests to submit")
      return
    }
    setSubmitDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitDialogOpen(false)
    setSubmitting(true)
    try {
      const today = getTodayDateWIB()
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
        toast.success("Request submitted successfully")
        fetchSementara()
        fetchDailyLimit()
      } else {
        const error = await response.json()
        toast.error(error.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong while submitting request")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStok = stokBarang.find((s) => s.kodeBrg === formData.kodeBrg)
  const formDisabled = dailyLimit?.alreadySubmitted ?? false

  return (
    <DashboardLayout title="Goods Request">
      {sementaraList.length > 0 && !formDisabled ? (
        <PageActions>
          <Button
            onClick={handleSubmitClick}
            disabled={submitting || formDisabled}
          >
            {submitting ? "Sending..." : "Submit Request"}
          </Button>
        </PageActions>
      ) : null}

      <div className="space-y-6">
        {formDisabled ? (
          <Alert>
            <AlertDescription>{PERMINTAAN_DAILY_LIMIT_MESSAGE}</AlertDescription>
          </Alert>
        ) : null}

                <div className="grid gap-6 md:grid-cols-2">
          {/* Form */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Add Item</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="idJenis">Item type</Label>
                <Select
                  value={formData.idJenis}
                  onValueChange={(value) => {
                    setFormData({ idJenis: value, kodeBrg: "", jumlah: 0 })
                  }}
                  required
                  disabled={formDisabled}
                >
                  <SelectTrigger id="idJenis">
                    <SelectValue placeholder="Select item type" />
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
                <Label htmlFor="kodeBrg">Item name</Label>
                <Select
                  value={formData.kodeBrg}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kodeBrg: value })
                  }
                  required
                  disabled={!formData.idJenis || formDisabled}
                >
                  <SelectTrigger id="kodeBrg">
                    <SelectValue placeholder="Select item name" />
                  </SelectTrigger>
                  <SelectContent>
                    {stokBarang.map((stok) => (
                      <SelectItem key={stok.kodeBrg} value={stok.kodeBrg}>
                        {stok.namaBrg} (Remaining: {stok.sisa} {stok.satuan})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStok && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Available stock: <span className="font-semibold text-foreground">{selectedStok.sisa} {selectedStok.satuan}</span>
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="jumlah">Qty</Label>
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
                  disabled={formDisabled}
                />
              </div>

              <Button type="submit" className="w-full" disabled={formDisabled}>
                Add to Request
              </Button>
            </form>
          </Card>

          <PageSection title="Today's Requests">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : sementaraList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No goods requests today
              </p>
            ) : (
              <div className="space-y-2">
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item name</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sementaraList.map((item) => (
                        <TableRow key={item.idSementara}>
                          <TableCell>{item.stokbarang.namaBrg}</TableCell>
                          <TableCell>{item.jumlah}</TableCell>
                          <TableCell>{item.stokbarang.satuan}</TableCell>
                          <TableCell className="text-right">
                            <TableActions>
                              <TableActionButton
                                label="Delete"
                                icon={Trash2}
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(item.idSementara)}
                              />
                            </TableActions>
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
            <AlertDialogTitle>Submit request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
