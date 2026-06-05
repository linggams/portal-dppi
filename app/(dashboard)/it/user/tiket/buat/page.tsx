"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout, SectionCard } from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"

interface Kategori {
  idKategori: number
  nama: string
}

export default function BuatTiketPage() {  const router = useRouter()
  const { data: session } = useSession()
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    idKategori: "",
  })

  useEffect(() => {
    fetch("/api/it/kategori")
      .then(async (r) => {
        if (!r.ok) return []
        const ct = r.headers.get("content-type") ?? ""
        if (!ct.includes("application/json")) return []
        return r.json()
      })
      .then((data) => setKategori(Array.isArray(data) ? data : []))
      .catch(() => setKategori([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.idKategori) {
      toast.error("Pilih kategori tiket")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/it/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: form.judul,
          deskripsi: form.deskripsi,
          idKategori: parseInt(form.idKategori),
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success("Tiket berhasil dibuat")
      router.push(`/it/user/tiket/${data.idTiket}`)
    } catch {
      toast.error("Gagal membuat tiket")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Buat Tiket IT">
      <SectionCard title="Form Tiket">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={session?.user?.username ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input value={session?.user?.jabatan ?? ""} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Ringkasan masalah"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select
              value={form.idKategori}
              onValueChange={(v) => setForm({ ...form, idKategori: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategori.map((k) => (
                  <SelectItem
                    key={k.idKategori}
                    value={String(k.idKategori)}
                  >
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) =>
                setForm({ ...form, deskripsi: e.target.value })
              }
              placeholder="Jelaskan masalah secara detail..."
              rows={6}
              required
              minLength={5}
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Kirim Tiket"}
          </Button>
        </form>
      </SectionCard>
    </DashboardLayout>
  )
}
