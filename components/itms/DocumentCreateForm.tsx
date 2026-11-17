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

export function ItmsDocumentCreateForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [tags, setTags] = useState("")
  const [visibility, setVisibility] = useState<"internal_all" | "it_only">(
    "internal_all"
  )
  const [effectiveDate, setEffectiveDate] = useState("")
  const [nextReviewAt, setNextReviewAt] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/itms/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          tags,
          visibility,
          changeNote: "Initial draft",
          effectiveDate: effectiveDate || null,
          nextReviewAt: nextReviewAt || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create SOP")
        return
      }
      toast.success("SOP draft created")
      router.push(`/itms/console/sop/${data.idDocument}`)
    } catch {
      toast.error("Failed to create SOP")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="New SOP">
      <form onSubmit={onSubmit} className="mx-auto grid max-w-3xl gap-5">
        <div className="rounded-xl border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Create a controlled SOP with document number, ownership, and review
          cycle.
        </div>

        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            placeholder="e.g. VPN Access Request Procedure"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) =>
                setVisibility(v as "internal_all" | "it_only")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal_all">All employees</SelectItem>
                <SelectItem value="it_only">IT only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vpn, network, access"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="effective">Effective date</Label>
            <Input
              id="effective"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="review">Next review date</Label>
            <Input
              id="review"
              type="date"
              value={nextReviewAt}
              onChange={(e) => setNextReviewAt(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="body">Content</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={14}
            placeholder={`# Purpose\n\n## Scope\n\n## Procedure\n- Step one\n- Step two`}
          />
          <p className="text-xs text-muted-foreground">
            Tip: use # / ## for headings and - for bullet lists.
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save SOP draft"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/itms/console/sop">Cancel</Link>
          </Button>
        </div>
      </form>
    </DashboardLayout>
  )
}
