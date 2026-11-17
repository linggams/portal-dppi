"use client"

import { useEffect, useMemo, useState } from "react"
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
import { computePriority, ITMS_PRIORITY_LABEL } from "@/lib/itms/constants"
import type { ItmsImpact, ItmsUrgency } from "@prisma/client"

import { readPaginatedJson } from "@/lib/shared/pagination"

type Category = { idCategory: number; name: string }
type AssetOpt = { idAsset: number; tag: string; type: string }
type KbOpt = { idDocument: number; title: string }

export default function ItmsCreateTicketPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [assets, setAssets] = useState<AssetOpt[]>([])
  const [sops, setSops] = useState<KbOpt[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [idCategory, setIdCategory] = useState("")
  const [idAsset, setIdAsset] = useState("")
  const [idKbDocument, setIdKbDocument] = useState("")
  const [type, setType] = useState<"incident" | "service_request">("incident")
  const [impact, setImpact] = useState<ItmsImpact>("low")
  const [urgency, setUrgency] = useState<ItmsUrgency>("low")

  const priority = useMemo(
    () => computePriority(impact, urgency),
    [impact, urgency]
  )

  useEffect(() => {
    fetch("/api/itms/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]))

    Promise.all([
      fetch("/api/itms/assets?mine=true&page=1").then(async (r) =>
        r.ok ? readPaginatedJson<AssetOpt>(await r.json()).data : []
      ),
      fetch("/api/itms/knowledge?published=true&page=1").then(async (r) =>
        r.ok ? readPaginatedJson<KbOpt>(await r.json()).data : []
      ),
    ])
      .then(([assetRows, sopRows]) => {
        setAssets(assetRows)
        setSops(sopRows)
      })
      .catch(() => undefined)
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idCategory) {
      toast.error("Please select a category")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/itms/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          idCategory: Number(idCategory),
          type,
          impact,
          urgency,
          idAsset: idAsset ? Number(idAsset) : null,
          idKbDocument: idKbDocument ? Number(idKbDocument) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create ticket")
        return
      }
      toast.success(`Ticket ${data.number} created`)
      router.push(`/itms/portal/tickets/${data.idTicket}`)
    } catch {
      toast.error("Failed to create ticket")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Create Ticket">
      <form onSubmit={onSubmit} className="mx-auto grid max-w-2xl gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            placeholder="Brief summary of the issue"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) =>
                setType(v as "incident" | "service_request")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="service_request">Service Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={idCategory} onValueChange={setIdCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.idCategory} value={String(c.idCategory)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Impact</Label>
            <Select
              value={impact}
              onValueChange={(v) => setImpact(v as ItmsImpact)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Urgency</Label>
            <Select
              value={urgency}
              onValueChange={(v) => setUrgency(v as ItmsUrgency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Input value={ITMS_PRIORITY_LABEL[priority]} readOnly />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Related asset (optional)</Label>
            <Select
              value={idAsset || "none"}
              onValueChange={(v) => setIdAsset(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {assets.map((a) => (
                  <SelectItem key={a.idAsset} value={String(a.idAsset)}>
                    {a.tag} · {a.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Related SOP (optional)</Label>
            <Select
              value={idKbDocument || "none"}
              onValueChange={(v) => setIdKbDocument(v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {sops.map((a) => (
                  <SelectItem key={a.idDocument} value={String(a.idDocument)}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={3}
            rows={6}
            placeholder="Describe the problem, steps to reproduce, and any error messages."
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/itms/portal/tickets">Cancel</Link>
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}
