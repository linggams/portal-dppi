"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ContentEmpty } from "@/components/layout"
import { usePageTitle } from "@/components/layout/page-title-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/itms/StatusBadge"
import { canAccessItmsStaff } from "@/lib/auth/permissions"
import { canRequesterCancelTicket } from "@/lib/itms/constants"
import { formatTicketDate } from "@/lib/itms/format"
import { minutesUntil, slaState } from "@/lib/itms/sla"
import { readPaginatedJson } from "@/lib/shared/pagination"
import type { ItmsTicketStatus } from "@prisma/client"

type TicketDetailData = {
  idTicket: number
  number: string
  title: string
  description: string
  type: string
  status: ItmsTicketStatus
  priority: "p1" | "p2" | "p3" | "p4"
  impact: string
  urgency: string
  createdAt: string
  dueResponseAt: string | null
  dueResolutionAt: string | null
  firstRespondedAt: string | null
  resolvedAt: string | null
  closedAt: string | null
  csatScore: number | null
  idRequester: number
  category: { name: string }
  requester: { username: string; jabatan: string }
  assignee: { username: string } | null
  asset: { idAsset: number; tag: string; type: string } | null
  kbDocument: {
    idDocument: number
    title: string
    number: string | null
  } | null
  comments: Array<{
    idComment: number
    body: string
    isInternal: boolean
    createdAt: string
    author: { username: string }
  }>
}

export function ItmsTicketDetail({
  ticketId,
  basePath,
}: {
  ticketId: number
  basePath: "/itms/portal" | "/itms/console"
}) {
  const { data: session } = useSession()
  const isStaff = canAccessItmsStaff(session?.user ?? {})
  const [ticket, setTicket] = useState<TicketDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState("")
  const [csatScore, setCsatScore] = useState("5")
  const [csatComment, setCsatComment] = useState("")
  const [busy, setBusy] = useState(false)
  const [assets, setAssets] = useState<
    Array<{ idAsset: number; tag: string; type: string }>
  >([])
  const [sops, setSops] = useState<
    Array<{ idDocument: number; title: string }>
  >([])
  const [linkAssetId, setLinkAssetId] = useState("")
  const [linkKbId, setLinkKbId] = useState("")

  usePageTitle(ticket?.number ?? "Ticket")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/itms/tickets/${ticketId}`)
      if (!res.ok) {
        setTicket(null)
        return
      }
      const data = await res.json()
      setTicket(data)
      setLinkAssetId(data.asset ? String(data.asset.idAsset) : "")
      setLinkKbId(data.kbDocument ? String(data.kbDocument.idDocument) : "")
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isStaff && basePath !== "/itms/console") return
    Promise.all([
      fetch("/api/itms/assets?page=1&page_size=50").then(async (r) =>
        r.ok ? readPaginatedJson(await r.json()).data : []
      ),
      fetch("/api/itms/knowledge?page=1&published=true").then(async (r) =>
        r.ok ? readPaginatedJson(await r.json()).data : []
      ),
    ])
      .then(([assetRows, sopRows]) => {
        setAssets(
          (assetRows as Array<{ idAsset: number; tag: string; type: string }>) ??
            []
        )
        setSops(
          (sopRows as Array<{ idDocument: number; title: string }>) ?? []
        )
      })
      .catch(() => undefined)
  }, [isStaff, basePath])

  const patch = async (body: Record<string, unknown>, okMsg: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/itms/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Update failed")
        return
      }
      setTicket(data)
      toast.success(okMsg)
    } catch {
      toast.error("Update failed")
    } finally {
      setBusy(false)
    }
  }

  const sendComment = async () => {
    if (!comment.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/itms/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment, isInternal }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to post comment")
        return
      }
      setComment("")
      setIsInternal(false)
      toast.success("Comment posted")
      await load()
    } catch {
      toast.error("Failed to post comment")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (!ticket) {
    return <ContentEmpty title="Ticket not found" />
  }

  const userId = Number(session?.user?.id)
  const isOwner = ticket.idRequester === userId
  const responseSla = slaState(
    ticket.dueResponseAt ? new Date(ticket.dueResponseAt) : null,
    ticket.firstRespondedAt ? new Date(ticket.firstRespondedAt) : null
  )
  const resolutionMins = minutesUntil(
    ticket.dueResolutionAt ? new Date(ticket.dueResolutionAt) : null
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{ticket.number}</h1>
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
          </div>
          <p className="mt-1 text-lg">{ticket.title}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {ticket.description}
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-medium">Conversation</h2>
          <div className="space-y-3 rounded-md border p-3">
            {ticket.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              ticket.comments.map((c) => (
                <div key={c.idComment} className="border-b pb-3 last:border-0">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {c.author.username}
                    </span>
                    {c.isInternal ? (
                      <span className="rounded bg-amber-100 px-1.5 text-amber-800">
                        Internal
                      </span>
                    ) : null}
                    <span>{formatTicketDate(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a reply…"
              rows={3}
            />
            {isStaff ? (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={isInternal}
                  onCheckedChange={(v) => setIsInternal(v === true)}
                />
                Internal note (hidden from requester)
              </label>
            ) : null}
            <Button onClick={sendComment} disabled={busy || !comment.trim()}>
              Send
            </Button>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border p-3 text-sm space-y-2">
          <div>
            <span className="text-muted-foreground">Category</span>
            <p>{ticket.category.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="capitalize">{ticket.type.replace("_", " ")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Requester</span>
            <p>
              {ticket.requester.username} · {ticket.requester.jabatan}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Assignee</span>
            <p>{ticket.assignee?.username ?? "Unassigned"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <p>{formatTicketDate(ticket.createdAt)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Response SLA</span>
            <p className="capitalize">{responseSla}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Resolution due</span>
            <p>
              {resolutionMins == null
                ? "—"
                : resolutionMins >= 0
                  ? `${resolutionMins} min left`
                  : `${Math.abs(resolutionMins)} min overdue`}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Related asset</span>
            <p>
              {ticket.asset ? (
                <Link
                  className="underline"
                  href={`${basePath === "/itms/console" ? "/itms/console/assets" : "/itms/portal/assets"}/${ticket.asset.idAsset}`}
                >
                  {ticket.asset.tag} ({ticket.asset.type})
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Related SOP</span>
            <p>
              {ticket.kbDocument ? (
                <Link
                  className="underline"
                  href={`${basePath}/sop/${ticket.kbDocument.idDocument}`}
                >
                  {ticket.kbDocument.title}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>

        {isStaff && basePath === "/itms/console" ? (
          <div className="space-y-2 rounded-md border p-3">
            <Label>Link asset</Label>
            <Select
              value={linkAssetId || "none"}
              onValueChange={(v) => setLinkAssetId(v === "none" ? "" : v)}
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
            <Label>Link SOP</Label>
            <Select
              value={linkKbId || "none"}
              onValueChange={(v) => setLinkKbId(v === "none" ? "" : v)}
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
            <Button
              className="w-full"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                patch(
                  {
                    action: "link",
                    idAsset: linkAssetId ? Number(linkAssetId) : null,
                    idKbDocument: linkKbId ? Number(linkKbId) : null,
                  },
                  "Links updated"
                )
              }
            >
              Save links
            </Button>
          </div>
        ) : null}

        {isStaff && basePath === "/itms/console" ? (
          <div className="space-y-2 rounded-md border p-3">
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => patch({ action: "assign_self" }, "Ticket assigned to you")}
            >
              Assign to me
            </Button>
            <Label>Update status</Label>
            <Select value={statusUpdate} onValueChange={setStatusUpdate}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              variant="secondary"
              disabled={busy || !statusUpdate}
              onClick={() =>
                patch(
                  { action: "set_status", status: statusUpdate },
                  "Status updated"
                )
              }
            >
              Apply status
            </Button>
          </div>
        ) : null}

        {isOwner && canRequesterCancelTicket(ticket.status) ? (
          <Button
            variant="destructive"
            className="w-full"
            disabled={busy}
            onClick={() => patch({ action: "cancel" }, "Ticket cancelled")}
          >
            Cancel ticket
          </Button>
        ) : null}

        {isOwner && ticket.status === "resolved" ? (
          <div className="space-y-2 rounded-md border p-3">
            <Button
              className="w-full"
              disabled={busy}
              onClick={() =>
                patch({ action: "confirm_close" }, "Ticket closed")
              }
            >
              Confirm close
            </Button>
            <Button
              className="w-full"
              variant="outline"
              disabled={busy}
              onClick={() => patch({ action: "reopen" }, "Ticket reopened")}
            >
              Reopen
            </Button>
          </div>
        ) : null}

        {isOwner && ticket.status === "closed" && ticket.csatScore == null ? (
          <div className="space-y-2 rounded-md border p-3">
            <Label>CSAT (1–5)</Label>
            <Select value={csatScore} onValueChange={setCsatScore}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={csatComment}
              onChange={(e) => setCsatComment(e.target.value)}
              placeholder="Optional feedback"
              rows={2}
            />
            <Button
              className="w-full"
              disabled={busy}
              onClick={() =>
                patch(
                  {
                    action: "csat",
                    score: Number(csatScore),
                    comment: csatComment || undefined,
                  },
                  "Thank you for your feedback"
                )
              }
            >
              Submit CSAT
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
