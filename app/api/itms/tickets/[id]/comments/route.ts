import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

const createSchema = z.object({
  body: z.string().min(1),
  isInternal: z.boolean().optional(),
})

export async function POST(
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

    const ticket = await prisma.itmsTicket.findUnique({
      where: { idTicket: id },
    })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const userId = Number(session.user.id)
    const isStaff = canAccessItmsStaff(session.user)
    if (!isStaff && ticket.idRequester !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = createSchema.parse(await request.json())
    const isInternal = isStaff ? Boolean(body.isInternal) : false

    const comment = await prisma.itmsTicketComment.create({
      data: {
        idTicket: id,
        idAuthor: userId,
        body: body.body,
        isInternal,
      },
      include: {
        author: { select: { idUser: true, username: true } },
      },
    })

    if (!ticket.firstRespondedAt && isStaff) {
      await prisma.itmsTicket.update({
        where: { idTicket: id },
        data: { firstRespondedAt: new Date() },
      })
    }

    await prisma.itmsTicketEvent.create({
      data: {
        idTicket: id,
        idActor: userId,
        type: isInternal ? "ticket.internal_note" : "ticket.comment",
        payload: { idComment: comment.idComment },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS comment POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
