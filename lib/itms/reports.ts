import type { ItmsTicketStatus } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

const OPEN: ItmsTicketStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "pending",
]

function startOfDaysAgo(days: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (days - 1))
  return d
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function getItmsDashboardStats(options?: { days?: number }) {
  const days = options?.days ?? 30
  const since = startOfDaysAgo(days)
  const now = new Date()

  const [
    openCount,
    unassignedCount,
    createdInPeriod,
    resolvedInPeriod,
    breachedResolution,
    csatAgg,
    byCategory,
    byPriority,
    recentCreated,
    nearBreach,
    resolvedWithDue,
  ] = await Promise.all([
    prisma.itmsTicket.count({ where: { status: { in: OPEN } } }),
    prisma.itmsTicket.count({
      where: { status: { in: OPEN }, idAssignee: null },
    }),
    prisma.itmsTicket.count({ where: { createdAt: { gte: since } } }),
    prisma.itmsTicket.findMany({
      where: { resolvedAt: { gte: since, not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),
    prisma.itmsTicket.count({
      where: {
        dueResolutionAt: { not: null, lt: now },
        status: { in: OPEN },
      },
    }),
    prisma.itmsTicket.aggregate({
      where: { csatScore: { not: null }, closedAt: { gte: since } },
      _avg: { csatScore: true },
      _count: { csatScore: true },
    }),
    prisma.itmsTicket.groupBy({
      by: ["idCategory"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { idCategory: "desc" } },
      take: 8,
    }),
    prisma.itmsTicket.groupBy({
      by: ["priority"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.itmsTicket.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.itmsTicket.findMany({
      where: {
        status: { in: OPEN },
        dueResolutionAt: {
          not: null,
          gte: now,
          lte: new Date(now.getTime() + 2 * 60 * 60_000),
        },
      },
      orderBy: { dueResolutionAt: "asc" },
      take: 8,
      select: {
        idTicket: true,
        number: true,
        title: true,
        priority: true,
        dueResolutionAt: true,
        assignee: { select: { username: true } },
      },
    }),
    prisma.itmsTicket.findMany({
      where: {
        resolvedAt: { gte: since, not: null },
        dueResolutionAt: { not: null },
      },
      select: { resolvedAt: true, dueResolutionAt: true },
    }),
  ])

  const mttrMinutes =
    resolvedInPeriod.length === 0
      ? null
      : Math.round(
          resolvedInPeriod.reduce((sum, t) => {
            const end = t.resolvedAt!.getTime()
            return sum + (end - t.createdAt.getTime()) / 60_000
          }, 0) / resolvedInPeriod.length
        )

  const slaMet = resolvedWithDue.filter(
    (t) => t.resolvedAt! <= t.dueResolutionAt!
  ).length
  const resolutionSlaPct =
    resolvedWithDue.length === 0
      ? null
      : Math.round((slaMet / resolvedWithDue.length) * 1000) / 10

  const categoryIds = byCategory.map((c) => c.idCategory)
  const categories = categoryIds.length
    ? await prisma.itmsCategory.findMany({
        where: { idCategory: { in: categoryIds } },
        select: { idCategory: true, name: true },
      })
    : []
  const catName = new Map(categories.map((c) => [c.idCategory, c.name]))

  const volumeByDayMap = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    volumeByDayMap.set(dayKey(d), 0)
  }
  for (const t of recentCreated) {
    const key = dayKey(t.createdAt)
    if (volumeByDayMap.has(key)) {
      volumeByDayMap.set(key, (volumeByDayMap.get(key) ?? 0) + 1)
    }
  }

  return {
    periodDays: days,
    openCount,
    unassignedCount,
    createdInPeriod,
    resolvedCount: resolvedInPeriod.length,
    mttrMinutes,
    resolutionSlaPct,
    openBreached: breachedResolution,
    csatAverage:
      csatAgg._avg.csatScore == null
        ? null
        : Math.round(csatAgg._avg.csatScore * 10) / 10,
    csatCount: csatAgg._count.csatScore,
    byCategory: byCategory.map((c) => ({
      idCategory: c.idCategory,
      name: catName.get(c.idCategory) ?? `#${c.idCategory}`,
      count: c._count._all,
    })),
    byPriority: byPriority.map((p) => ({
      priority: p.priority,
      count: p._count._all,
    })),
    volumeByDay: [...volumeByDayMap.entries()].map(([date, count]) => ({
      date,
      count,
    })),
    nearBreach,
  }
}
