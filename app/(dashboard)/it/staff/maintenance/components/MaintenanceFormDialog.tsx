"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IT_HASIL_PEKERJAAN,
  IT_HASIL_PEKERJAAN_LABEL,
  IT_JENIS_PEKERJAAN,
  IT_JENIS_PEKERJAAN_LABEL,
} from "@/lib/it/maintenance-shared"

interface KategoriOption {
  idKategori: number
  nama: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: KategoriOption[]
  defaultUsername: string
  onSuccess: () => void
}

function toLocalDatetimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  kategori,
  defaultUsername,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [idKategori, setIdKategori] = useState("")
  const [tglKerja, setTglKerja] = useState("")
  const [jenisPekerjaan, setJenisPekerjaan] = useState<string>("")
  const [lokasi, setLokasi] = useState("")
  const [judul, setJudul] = useState("")
  const [uraian, setUraian] = useState("")
  const [durasiMenit, setDurasiMenit] = useState("")
  const [hasil, setHasil] = useState<string>("selesai")
  const [idTiket, setIdTiket] = useState("")

  useEffect(() => {
    if (open) {
      setTglKerja(toLocalDatetimeValue(new Date()))
      setIdKategori(kategori[0] ? String(kategori[0].idKategori) : "")
    }
  }, [open, kategori])

  const reset = () => {
    setJenisPekerjaan("")
    setLokasi("")
    setJudul("")
    setUraian("")
    setDurasiMenit("")
    setHasil("selesai")
    setIdTiket("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idKategori || !judul.trim() || !uraian.trim() || !tglKerja) {
      toast.error("Lengkapi field wajib")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/it/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idKategori: parseInt(idKategori, 10),
          tglKerja: new Date(tglKerja).toISOString(),
          jenisPekerjaan: jenisPekerjaan || null,
          lokasi: lokasi.trim() || null,
          judul: judul.trim(),
          uraian: uraian.trim(),
          durasiMenit: durasiMenit ? parseInt(durasiMenit, 10) : null,
          hasil,
          idTiket: idTiket ? parseInt(idTiket, 10) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(
          typeof err.error === "string" ? err.error : "Gagal menyimpan pekerjaan"
        )
        return
      }

      toast.success("Pekerjaan tercatat")
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Gagal menyimpan pekerjaan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Catat Pekerjaan</DialogTitle>
          <DialogDescription>
            Log maintenance manual oleh {defaultUsername || "teknisi"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="mfTgl">Tanggal & waktu *</Label>
            <Input
              id="mfTgl"
              type="datetime-local"
              value={tglKerja}
              onChange={(e) => setTglKerja(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfKategori">Kategori *</Label>
            <Select
              value={idKategori}
              onValueChange={setIdKategori}
              required
              disabled={submitting}
            >
              <SelectTrigger id="mfKategori">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategori.map((k) => (
                  <SelectItem key={k.idKategori} value={String(k.idKategori)}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfJenis">Jenis pekerjaan</Label>
            <Select
              value={jenisPekerjaan || "none"}
              onValueChange={(v) => setJenisPekerjaan(v === "none" ? "" : v)}
              disabled={submitting}
            >
              <SelectTrigger id="mfJenis">
                <SelectValue placeholder="Opsional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {IT_JENIS_PEKERJAAN.map((j) => (
                  <SelectItem key={j} value={j}>
                    {IT_JENIS_PEKERJAAN_LABEL[j]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfLokasi">Lokasi / unit</Label>
            <Input
              id="mfLokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: HRD, Gedung 1"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfJudul">Judul singkat *</Label>
            <Input
              id="mfJudul"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfUraian">Uraian pekerjaan *</Label>
            <Textarea
              id="mfUraian"
              value={uraian}
              onChange={(e) => setUraian(e.target.value)}
              rows={4}
              required
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfDurasi">Durasi (menit)</Label>
            <Input
              id="mfDurasi"
              type="number"
              min={0}
              value={durasiMenit}
              onChange={(e) => setDurasiMenit(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfHasil">Hasil *</Label>
            <Select
              value={hasil}
              onValueChange={setHasil}
              disabled={submitting}
            >
              <SelectTrigger id="mfHasil">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IT_HASIL_PEKERJAAN.map((h) => (
                  <SelectItem key={h} value={h}>
                    {IT_HASIL_PEKERJAAN_LABEL[h]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mfTiket">ID tiket (opsional)</Label>
            <Input
              id="mfTiket"
              type="number"
              min={1}
              value={idTiket}
              onChange={(e) => setIdTiket(e.target.value)}
              placeholder="Taut ke tiket yang ada"
              disabled={submitting}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
