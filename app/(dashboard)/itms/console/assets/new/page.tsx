"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout"
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
import { ASSET_TYPE_OPTIONS } from "@/lib/itms/assets"

export default function ItmsNewAssetPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [tag, setTag] = useState("")
  const [type, setType] = useState<string>(ASSET_TYPE_OPTIONS[0])
  const [serialNumber, setSerialNumber] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [location, setLocation] = useState("")
  const [specs, setSpecs] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/itms/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tag,
          type,
          serialNumber: serialNumber || null,
          brand,
          model,
          location,
          specs,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create asset")
        return
      }
      toast.success(`Asset ${data.tag} created`)
      router.push(`/itms/console/assets/${data.idAsset}`)
    } catch {
      toast.error("Failed to create asset")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Asset">
      <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tag">Asset tag</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              required
              placeholder="LT-001"
            />
          </div>
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="serial">Serial number</Label>
            <Input
              id="serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="specs">Specs / notes</Label>
          <Textarea
            id="specs"
            value={specs}
            onChange={(e) => setSpecs(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Create asset"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/itms/console/assets">Cancel</Link>
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}
