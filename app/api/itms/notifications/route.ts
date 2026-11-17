import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessItms } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true"

    const notifications = await prisma.itmsNotification.findMany({
      where: {
        idUser: userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    })

    const unreadCount = await prisma.itmsNotification.count({
      where: { idUser: userId, readAt: null },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("ITMS notifications GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number(session.user.id)
    const body = await request.json().catch(() => ({}))
    const id = typeof body.idNotification === "number" ? body.idNotification : null

    if (body.action === "read_all") {
      await prisma.itmsNotification.updateMany({
        where: { idUser: userId, readAt: null },
        data: { readAt: new Date() },
      })
      return NextResponse.json({ ok: true })
    }

    if (id) {
      await prisma.itmsNotification.updateMany({
        where: { idNotification: id, idUser: userId },
        data: { readAt: new Date() },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("ITMS notifications PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
