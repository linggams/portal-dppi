import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Prisma } from "@prisma/client"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { computePriority } from "@/lib/itms/constants"
import { generateTicketNumber } from "@/lib/itms/number"
import { notifyTicketCreated } from "@/lib/itms/notify"
import { computeSlaDeadlines, getSlaPolicyForPriority } from "@/lib/itms/sla"
import {
  parsePaginationParams,
  toPaginatedResult,
} from "@/lib/shared/pagination"

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3),
  idCategory: z.number().int().positive(),
  type: z.enum(["incident", "service_request"]).default("incident"),
  impact: z.enum(["high", "medium", "low"]).default("low"),
  urgency: z.enum(["high", "medium", "low"]).default("low"),
  idAsset: z.number().int().positive().nullable().optional(),
  idKbDocument: z.number().int().positive().nullable().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePaginationParams(params)
    const mine = params.get("mine") === "true"
    const status = params.get("status")
    const isStaff = canAccessItmsStaff(session.user)
    const userId = Number(session.user.id)

    const where: Prisma.ItmsTicketWhereInput = {}

    if (mine || !isStaff) {
      where.idRequester = userId
    }

    if (status) {
      where.status = status as Prisma.EnumItmsTicketStatusFilter["equals"]
    }

    const assignee = params.get("assignee")
    if (isStaff && assignee === "me") {
      where.idAssignee = userId
    } else if (isStaff && assignee === "unassigned") {
      where.idAssignee = null
      where.status = { in: ["new", "assigned", "in_progress", "pending"] }
    }

    const [total, tickets] = await Promise.all([
      prisma.itmsTicket.count({ where }),
      prisma.itmsTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          category: { select: { idCategory: true, name: true } },
          requester: { select: { idUser: true, username: true, jabatan: true } },
          assignee: { select: { idUser: true, username: true } },
        },
      }),
    ])

    return NextResponse.json(
      toPaginatedResult(tickets, total, page, pageSize)
    )
  } catch (error) {
    console.error("ITMS tickets GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = createSchema.parse(await request.json())
    const category = await prisma.itmsCategory.findFirst({
      where: { idCategory: body.idCategory, active: true },
    })
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 })
    }

    const priority = computePriority(body.impact, body.urgency)
    const number = await generateTicketNumber(body.type)
    const sla = await getSlaPolicyForPriority(priority)
    const createdAt = new Date()
    const deadlines = sla
      ? computeSlaDeadlines(
          createdAt,
          sla.responseMinutes,
          sla.resolutionMinutes
        )
      : { dueResponseAt: null, dueResolutionAt: null }

    const userId = Number(session.user.id)

    const ticket = await prisma.itmsTicket.create({
      data: {
        number,
        type: body.type,
        title: body.title,
        description: body.description,
        idCategory: body.idCategory,
        impact: body.impact,
        urgency: body.urgency,
        priority,
        status: "new",
        idRequester: userId,
        idAsset: body.idAsset ?? null,
        idKbDocument: body.idKbDocument ?? null,
        idSlaPolicy: sla?.idPolicy ?? null,
        dueResponseAt: deadlines.dueResponseAt,
        dueResolutionAt: deadlines.dueResolutionAt,
        events: {
          create: {
            idActor: userId,
            type: "ticket.created",
            payload: { priority, number },
          },
        },
      },
      include: {
        category: { select: { idCategory: true, name: true } },
        requester: { select: { idUser: true, username: true } },
        asset: { select: { idAsset: true, tag: true } },
        kbDocument: { select: { idDocument: true, title: true } },
      },
    })

    void notifyTicketCreated({
      idTicket: ticket.idTicket,
      number: ticket.number,
      title: ticket.title,
      idRequester: ticket.idRequester,
    }).catch((err) => console.error("ITMS notify create:", err))

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS tickets POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
