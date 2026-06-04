import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canManageItTiket } from "@/lib/it/constants"
import { z } from "zod"

const komentarSchema = z.object({
  pesan: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const tiketId = parseInt(id)

    const tiket = await prisma.itTiket.findUnique({
      where: { idTiket: tiketId },
    })

    if (!tiket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const isOwner = tiket.username === session.user.username
    const isStaff = canManageItTiket(session.user.level)

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const data = komentarSchema.parse(body)

    const komentar = await prisma.itTiketKomentar.create({
      data: {
        idTiket: tiketId,
        username: session.user.username,
        pesan: data.pesan,
        tipe: "komentar",
      },
    })

    await prisma.itTiket.update({
      where: { idTiket: tiketId },
      data: { tglDiupdate: new Date() },
    })

    return NextResponse.json(komentar, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error adding komentar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
