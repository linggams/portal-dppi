"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ITMS_PRIORITY_LABEL } from "@/lib/itms/constants"
import { formatTicketDate } from "@/lib/itms/format"

type DashboardStats = {
  periodDays: number
  openCount: number
  unassignedCount: number
  createdInPeriod: number
  resolvedCount: number
  mttrMinutes: number | null
  resolutionSlaPct: number | null
  openBreached: number
  csatAverage: number | null
  csatCount: number
  byCategory: Array<{ idCategory: number; name: string; count: number }>
  byPriority: Array<{ priority: "p1" | "p2" | "p3" | "p4"; count: number }>
  volumeByDay: Array<{ date: string; count: number }>
  nearBreach: Array<{
    idTicket: number
    number: string
    title: string
    priority: "p1" | "p2" | "p3" | "p4"
    dueResolutionAt: string | null
    assignee: { username: string } | null
  }>
}

type NotificationItem = {
  idNotification: number
  title: string
  body: string
  href: string | null
  readAt: string | null
  createdAt: string
}

function formatMttr(minutes: number | null) {
  if (minutes == null) return "—"
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default function ItmsConsoleDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [mine, setMine] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const [statsRes, mineRes, notifRes] = await Promise.all([
        fetch("/api/itms/reports/dashboard?days=30"),
        fetch("/api/itms/tickets?page=1&assignee=me"),
        fetch("/api/itms/notifications"),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (mineRes.ok) {
        const json = await mineRes.json()
        setMine(typeof json.total === "number" ? json.total : null)
      }
      if (notifRes.ok) {
        const json = await notifRes.json()
        setNotifications(json.notifications ?? [])
        setUnread(json.unreadCount ?? 0)
      }
    }
    load().catch(() => undefined)
  }, [])

  const maxVolume = Math.max(
    1,
    ...(stats?.volumeByDay.map((d) => d.count) ?? [1])
  )

  const markAllRead = async () => {
    await fetch("/api/itms/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    })
    setUnread(0)
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    )
  }

  return (
    <DashboardLayout title="IT Management">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Last {stats?.periodDays ?? 30} days
        </p>
        <Button asChild>
          <Link href="/itms/console/tickets">Open ticket queue</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Open tickets</CardTitle>
            <CardDescription>All active statuses</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.openCount ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Unassigned</CardTitle>
            <CardDescription>Needs an agent</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.unassignedCount ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assigned to me</CardTitle>
            <CardDescription>Your queue</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {mine ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">SLA breached (open)</CardTitle>
            <CardDescription>Past resolution due</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-destructive">
            {stats?.openBreached ?? "—"}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Created</CardTitle>
            <CardDescription>In period</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.createdInPeriod ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resolved</CardTitle>
            <CardDescription>In period</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.resolvedCount ?? "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">MTTR</CardTitle>
            <CardDescription>Mean time to resolve</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {formatMttr(stats?.mttrMinutes ?? null)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resolution SLA</CardTitle>
            <CardDescription>
              CSAT{" "}
              {stats?.csatAverage == null
                ? "—"
                : `${stats.csatAverage}/5 (${stats.csatCount})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats?.resolutionSlaPct == null
              ? "—"
              : `${stats.resolutionSlaPct}%`}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume trend</CardTitle>
            <CardDescription>Tickets created per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-36 items-end gap-0.5">
              {(stats?.volumeByDay ?? []).map((d) => (
                <div
                  key={d.date}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{
                    height: `${Math.max(4, (d.count / maxVolume) * 100)}%`,
                  }}
                  title={`${d.date}: ${d.count}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
            <CardDescription>Top categories in period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(stats?.byCategory ?? []).length === 0 ? (
              <p className="text-muted-foreground">No data yet.</p>
            ) : (
              stats?.byCategory.map((c) => (
                <div
                  key={c.idCategory}
                  className="flex items-center justify-between gap-2"
                >
                  <span>{c.name}</span>
                  <Badge variant="secondary">{c.count}</Badge>
                </div>
              ))
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {(stats?.byPriority ?? []).map((p) => (
                <Badge key={p.priority} variant="outline">
                  {ITMS_PRIORITY_LABEL[p.priority]}: {p.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Near SLA breach</CardTitle>
            <CardDescription>Due within 2 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(stats?.nearBreach ?? []).length === 0 ? (
              <p className="text-muted-foreground">None right now.</p>
            ) : (
              stats?.nearBreach.map((t) => (
                <div key={t.idTicket} className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      className="font-medium underline-offset-2 hover:underline"
                      href={`/itms/console/tickets/${t.idTicket}`}
                    >
                      {t.number}
                    </Link>
                    <p className="text-muted-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.assignee?.username ?? "Unassigned"} · due{" "}
                      {t.dueResolutionAt
                        ? formatTicketDate(t.dueResolutionAt)
                        : "—"}
                    </p>
                  </div>
                  <Badge variant="destructive">
                    {ITMS_PRIORITY_LABEL[t.priority]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>
                {unread > 0 ? `${unread} unread` : "All caught up"}
              </CardDescription>
            </div>
            {unread > 0 ? (
              <Button size="sm" variant="outline" onClick={markAllRead}>
                Mark all read
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications yet.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div key={n.idNotification} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.readAt ? (
                      <span className="size-1.5 rounded-full bg-primary" />
                    ) : null}
                  </div>
                  <p className="text-muted-foreground">{n.body}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTicketDate(n.createdAt)}</span>
                    {n.href ? (
                      <Link className="underline" href={n.href}>
                        Open
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
