"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { DashboardLayout, ContentEmpty } from "@/components/layout"
import { SopDocumentShell } from "@/components/itms/SopDocumentShell"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { KB_STATUS_LABEL } from "@/lib/itms/kb"
import { formatTicketDate } from "@/lib/itms/format"
import type { ItmsKbStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

type DocDetail = {
  idDocument: number
  kind: string
  number: string | null
  title: string
  status: ItmsKbStatus
  tags: string
  visibility: "internal_all" | "it_only"
  effectiveDate: string | null
  nextReviewAt: string | null
  currentVersion: {
    idVersion: number
    version: number
    body: string
    changeNote: string
  } | null
  versions: Array<{
    idVersion: number
    version: number
    changeNote: string
    createdAt: string
  }>
  acknowledgments: Array<{
    idAck: number
    acknowledgedAt: string
    user: { username: string }
  }>
}

function toDateInput(value: string | null | undefined) {
  if (!value) return ""
  return value.slice(0, 10)
}

export function ItmsDocumentConsoleDetail({
  documentId,
}: {
  documentId: number
}) {
  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [newBody, setNewBody] = useState("")
  const [changeNote, setChangeNote] = useState("")
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState("")
  const [visibility, setVisibility] = useState<"internal_all" | "it_only">(
    "internal_all"
  )
  const [effectiveDate, setEffectiveDate] = useState("")
  const [nextReviewAt, setNextReviewAt] = useState("")
  const pageTitle = doc?.title ?? "SOP"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/itms/knowledge/${documentId}`)
      if (!res.ok) {
        setDoc(null)
        return
      }
      const data = await res.json()
      if (data.kind !== "sop") {
        setDoc(null)
        return
      }
      setDoc(data)
      setNewBody(data.currentVersion?.body ?? "")
      setTitle(data.title)
      setTags(data.tags ?? "")
      setVisibility(data.visibility)
      setEffectiveDate(toDateInput(data.effectiveDate))
      setNextReviewAt(toDateInput(data.nextReviewAt))
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    load()
  }, [load])

  const patch = async (body: Record<string, unknown>, okMsg: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/itms/knowledge/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Update failed")
        return
      }
      setDoc(data)
      setNewBody(data.currentVersion?.body ?? "")
      setTitle(data.title)
      setTags(data.tags ?? "")
      setVisibility(data.visibility)
      setEffectiveDate(toDateInput(data.effectiveDate))
      setNextReviewAt(toDateInput(data.nextReviewAt))
      toast.success(okMsg)
    } catch {
      toast.error("Update failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={pageTitle}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </DashboardLayout>
    )
  }
  if (!doc) {
    return (
      <DashboardLayout title={pageTitle}>
        <ContentEmpty title="SOP not found" />
      </DashboardLayout>
    )
  }

  const workflowActions = (
    <div className="flex flex-wrap gap-2">
      {doc.status === "draft" ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() =>
            patch({ action: "submit_review" }, "Submitted for review")
          }
        >
          Submit for review
        </Button>
      ) : null}
      {doc.status === "draft" || doc.status === "in_review" ? (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => patch({ action: "publish" }, "Published")}
        >
          Publish
        </Button>
      ) : null}
    </div>
  )

  return (
    <DashboardLayout title={pageTitle}>
      <SopDocumentShell
        backHref="/itms/console/sop"
        backLabel="Back to SOP register"
        actions={workflowActions}
        doc={{
          number: doc.number,
          title: doc.title,
          tags: doc.tags,
          statusLabel: KB_STATUS_LABEL[doc.status],
          effectiveDate: doc.effectiveDate,
          nextReviewAt: doc.nextReviewAt,
          version: doc.currentVersion?.version ?? null,
          body: doc.currentVersion?.body ?? "",
        }}
      />

      <Collapsible
        open={manageOpen}
        onOpenChange={setManageOpen}
        className="mt-4 overflow-hidden rounded-xl border bg-card"
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30"
          >
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Administration
              </p>
              <p className="text-sm font-medium">
                Update metadata, create a revision, or review acknowledgments
              </p>
            </div>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                manageOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-6 border-t px-5 py-5 lg:grid-cols-2">
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Document control</h3>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="network, access, vpn"
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
                  <Label>Effective date</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Next review date</Label>
                <Input
                  type="date"
                  value={nextReviewAt}
                  onChange={(e) => setNextReviewAt(e.target.value)}
                />
              </div>
              <Button
                disabled={busy}
                onClick={() =>
                  patch(
                    {
                      action: "update_meta",
                      title,
                      tags,
                      visibility,
                      effectiveDate: effectiveDate || null,
                      nextReviewAt: nextReviewAt || null,
                    },
                    "Document control updated"
                  )
                }
              >
                Save metadata
              </Button>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">New revision</h3>
              <Textarea
                rows={10}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
              />
              <div className="grid gap-2">
                <Label>Change note</Label>
                <Input
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Describe what changed in this revision"
                />
              </div>
              <Button
                disabled={busy || !newBody.trim()}
                onClick={() =>
                  patch(
                    {
                      action: "new_version",
                      body: newBody,
                      changeNote: changeNote || undefined,
                    },
                    "New revision saved as draft"
                  )
                }
              >
                Save as new revision
              </Button>
            </section>
          </div>

          <div className="grid gap-6 border-t px-5 py-5 lg:grid-cols-2">
            <section>
              <h3 className="mb-3 text-sm font-semibold">Revision history</h3>
              <ul className="space-y-3 text-sm">
                {doc.versions.map((v) => (
                  <li key={v.idVersion} className="border-b pb-3 last:border-0">
                    <p className="font-medium">Rev. {v.version}</p>
                    <p className="text-muted-foreground">
                      {formatTicketDate(v.createdAt)} —{" "}
                      {v.changeNote || "No note"}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-3 text-sm font-semibold">Acknowledgments</h3>
              {doc.acknowledgments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No acknowledgments recorded for the current revision yet.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {doc.acknowledgments.map((a) => (
                    <li key={a.idAck} className="flex justify-between gap-3">
                      <span className="font-medium">{a.user.username}</span>
                      <span className="text-muted-foreground">
                        {formatTicketDate(a.acknowledgedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </DashboardLayout>
  )
}
