import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { ItmsTicketStatus, Prisma } from "@prisma/client"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { canRequesterCancelTicket } from "@/lib/itms/constants"
import {
  notifyTicketAssigned,
  notifyTicketStatusForRequester,
} from "@/lib/itms/notify"
import { prisma } from "@/lib/db/prisma"

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("assign_self") }),
  z.object({
    action: z.literal("set_status"),
    status: z.enum([
      "assigned",
      "in_progress",
      "pending",
      "resolved",
      "closed",
      "cancelled",
    ]),
  }),
  z.object({
    action: z.literal("assign"),
    idAssignee: z.number().int().positive().nullable(),
  }),
  z.object({
    action: z.literal("link"),
    idAsset: z.number().int().positive().nullable().optional(),
    idKbDocument: z.number().int().positive().nullable().optional(),
  }),
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("confirm_close") }),
  z.object({ action: z.literal("reopen") }),
  z.object({
    action: z.literal("csat"),
    score: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
  }),
])

async function loadTicket(id: number) {
  return prisma.itmsTicket.findUnique({
    where: { idTicket: id },
    include: {
      category: { select: { idCategory: true, name: true } },
      requester: { select: { idUser: true, username: true, jabatan: true } },
      assignee: { select: { idUser: true, username: true } },
      asset: { select: { idAsset: true, tag: true, type: true } },
      kbDocument: {
        select: { idDocument: true, title: true, number: true, kind: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { idUser: true, username: true } },
        },
      },
      events: {
        orderBy: { createdAt: "asc" },
        include: {
          actor: { select: { idUser: true, username: true } },
        },
      },
      slaPolicy: true,
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const ticket = await loadTicket(id)
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const userId = Number(session.user.id)
    const isStaff = canAccessItmsStaff(session.user)
    if (!isStaff && ticket.idRequester !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const comments = isStaff
      ? ticket.comments
      : ticket.comments.filter((c) => !c.isInternal)

    return NextResponse.json({ ...ticket, comments })
  } catch (error) {
    console.error("ITMS ticket GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const existing = await prisma.itmsTicket.findUnique({
      where: { idTicket: id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const userId = Number(session.user.id)
    const isStaff = canAccessItmsStaff(session.user)
    const isOwner = existing.idRequester === userId
    const body = patchSchema.parse(await request.json())

    const data: Prisma.ItmsTicketUpdateInput = {}
    let eventType = "ticket.updated"
    let payload: Prisma.InputJsonValue = { action: body.action }

    if (body.action === "assign_self") {
      if (!isStaff) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      data.assignee = { connect: { idUser: userId } }
      data.status = existing.status === "new" ? "assigned" : existing.status
      if (!existing.firstRespondedAt) data.firstRespondedAt = new Date()
      eventType = "ticket.assigned"
      payload = { idAssignee: userId }
    } else if (body.action === "assign") {
      if (!isStaff) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (body.idAssignee == null) {
        data.assignee = { disconnect: true }
      } else {
        data.assignee = { connect: { idUser: body.idAssignee } }
        if (existing.status === "new") data.status = "assigned"
      }
      eventType = "ticket.assigned"
      payload = { idAssignee: body.idAssignee }
    } else if (body.action === "set_status") {
      if (!isStaff) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      const next = body.status as ItmsTicketStatus
      data.status = next
      if (next === "pending" && !existing.pendingStartedAt) {
        data.pendingStartedAt = new Date()
      }
      if (next !== "pending" && existing.pendingStartedAt) {
        const paused = Math.round(
          (Date.now() - existing.pendingStartedAt.getTime()) / 60_000
        )
        data.slaPausedMinutes = existing.slaPausedMinutes + Math.max(0, paused)
        data.pendingStartedAt = null
      }
      if (next === "resolved") data.resolvedAt = new Date()
      if (next === "closed") data.closedAt = new Date()
      if (!existing.firstRespondedAt && next !== "cancelled") {
        data.firstRespondedAt = new Date()
      }
      eventType = "ticket.status_changed"
      payload = { from: existing.status, to: next }
    } else if (body.action === "link") {
      if (!isStaff && !isOwner) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (body.idAsset !== undefined) {
        data.asset =
          body.idAsset == null
            ? { disconnect: true }
            : { connect: { idAsset: body.idAsset } }
      }
      if (body.idKbDocument !== undefined) {
        data.kbDocument =
          body.idKbDocument == null
            ? { disconnect: true }
            : { connect: { idDocument: body.idKbDocument } }
      }
      eventType = "ticket.linked"
      payload = {
        idAsset: body.idAsset ?? null,
        idKbDocument: body.idKbDocument ?? null,
      }
    } else if (body.action === "cancel") {
      if (!isOwner || !canRequesterCancelTicket(existing.status)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      data.status = "cancelled"
      data.closedAt = new Date()
      eventType = "ticket.cancelled"
    } else if (body.action === "confirm_close") {
      if (!isOwner || existing.status !== "resolved") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      data.status = "closed"
      data.closedAt = new Date()
      eventType = "ticket.closed"
    } else if (body.action === "reopen") {
      if (!isOwner || (existing.status !== "resolved" && existing.status !== "closed")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      data.status = "in_progress"
      data.resolvedAt = null
      data.closedAt = null
      eventType = "ticket.reopened"
    } else if (body.action === "csat") {
      if (!isOwner || existing.status !== "closed") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      data.csatScore = body.score
      data.csatComment = body.comment ?? null
      eventType = "ticket.csat"
      payload = { score: body.score }
    }

    await prisma.itmsTicket.update({
      where: { idTicket: id },
      data: {
        ...data,
        events: {
          create: {
            idActor: userId,
            type: eventType,
            payload: payload as Prisma.InputJsonValue,
          },
        },
      },
    })

    const ticket = await loadTicket(id)

    if (body.action === "assign_self") {
      void notifyTicketAssigned({
        idTicket: id,
        number: existing.number,
        title: existing.title,
        idAssignee: userId,
      }).catch((err) => console.error("ITMS notify assign:", err))
    } else if (body.action === "assign" && body.idAssignee) {
      void notifyTicketAssigned({
        idTicket: id,
        number: existing.number,
        title: existing.title,
        idAssignee: body.idAssignee,
      }).catch((err) => console.error("ITMS notify assign:", err))
    } else if (
      body.action === "set_status" ||
      body.action === "confirm_close" ||
      body.action === "cancel"
    ) {
      const status =
        body.action === "set_status"
          ? body.status
          : body.action === "confirm_close"
            ? "closed"
            : "cancelled"
      void notifyTicketStatusForRequester({
        idTicket: id,
        number: existing.number,
        title: existing.title,
        status,
        idRequester: existing.idRequester,
      }).catch((err) => console.error("ITMS notify status:", err))
    }

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS ticket PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
