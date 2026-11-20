"use client"

import { use, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardLayout, ContentEmpty } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ASSET_STATUS_LABEL } from "@/lib/itms/assets"
import { formatTicketDate, formatTicketDateOnly } from "@/lib/itms/format"
import type { ItmsAssetStatus } from "@prisma/client"

type UserOption = { idUser: number; username: string; jabatan: string }

type AssetDetail = {
  idAsset: number
  tag: string
  type: string
  serialNumber: string | null
  brand: string
  model: string
  specs: string
  location: string
  status: ItmsAssetStatus
  warrantyUntil: string | null
  holder: { idUser: number; username: string; jabatan: string } | null
  assignments: Array<{
    idAssignment: number
    assignedAt: string
    returnedAt: string | null
    conditionNote: string
    user: { username: string }
  }>
}

export default function ItmsConsoleAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const assetId = parseInt(id, 10)
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [users, setUsers] = useState<UserOption[]>([])
  const [assignUserId, setAssignUserId] = useState("")
  const [userQuery, setUserQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const pageTitle = asset?.tag ?? "Asset"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/itms/assets/${assetId}`)
      if (!res.ok) {
        setAsset(null)
        return
      }
      setAsset(await res.json())
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (userQuery.trim()) params.set("q", userQuery.trim())
      fetch(`/api/itms/users?${params}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setUsers([]))
    }, 250)
    return () => clearTimeout(timer)
  }, [userQuery])

  const patch = async (body: Record<string, unknown>, okMsg: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/itms/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Update failed")
        return
      }
      setAsset(data)
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
  if (!asset) {
    return (
      <DashboardLayout title={pageTitle}>
        <ContentEmpty title="Asset not found" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={pageTitle}>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{asset.tag}</h1>
            <Badge variant="secondary">
              {ASSET_STATUS_LABEL[asset.status]}
            </Badge>
          </div>
          <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Type</span>
              <br />
              {asset.type}
            </p>
            <p>
              <span className="text-muted-foreground">Brand / Model</span>
              <br />
              {[asset.brand, asset.model].filter(Boolean).join(" ") || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Serial</span>
              <br />
              {asset.serialNumber || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Location</span>
              <br />
              {asset.location || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Holder</span>
              <br />
              {asset.holder
                ? `${asset.holder.username} · ${asset.holder.jabatan}`
                : "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Warranty until</span>
              <br />
              {asset.warrantyUntil
                ? formatTicketDateOnly(asset.warrantyUntil)
                : "—"}
            </p>
            <p className="sm:col-span-2">
              <span className="text-muted-foreground">Specs</span>
              <br />
              <span className="whitespace-pre-wrap">{asset.specs || "—"}</span>
            </p>
          </div>

          <section className="rounded-md border p-4">
            <h2 className="mb-3 text-sm font-medium">Assignment history</h2>
            {asset.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {asset.assignments.map((a) => (
                  <li key={a.idAssignment}>
                    <span className="font-medium">{a.user.username}</span> ·{" "}
                    {formatTicketDate(a.assignedAt)}
                    {a.returnedAt
                      ? ` → returned ${formatTicketDate(a.returnedAt)}`
                      : " (active)"}
                    {a.conditionNote ? (
                      <span className="text-muted-foreground">
                        {" "}
                        — {a.conditionNote}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="space-y-2 rounded-md border p-3">
            <Label>Assign to user</Label>
            <Input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search username…"
            />
            <Select value={assignUserId} onValueChange={setAssignUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.idUser} value={String(u.idUser)}>
                    {u.username} · {u.jabatan}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full"
              disabled={busy || !assignUserId}
              onClick={() =>
                patch(
                  { action: "assign", idUser: Number(assignUserId) },
                  "Asset assigned"
                )
              }
            >
              Assign
            </Button>
            {asset.holder ? (
              <Button
                className="w-full"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  patch({ action: "return" }, "Asset returned to stock")
                }
              >
                Return to stock
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  )
}
