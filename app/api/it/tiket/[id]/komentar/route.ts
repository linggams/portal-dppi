import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canManageItTiket } from "@/lib/it/constants"
import { z } from "zod"
import { requireUserId } from "@/lib/purchasing/actor"

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

    const isOwner = tiket.idPemohon === requireUserId(session.user.id)
    const isStaff = canManageItTiket(session.user)

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const data = komentarSchema.parse(body)

    const komentar = await prisma.itTiketKomentar.create({
      data: {
        idTiket: tiketId,
        idUser: requireUserId(session.user.id),
        pesan: data.pesan,
        tipe: "komentar",
      },
      include: { penulis: { select: { username: true } } },
    })

    await prisma.itTiket.update({
      where: { idTiket: tiketId },
      data: { tglDiupdate: new Date() },
    })

    const { penulis, ...comment } = komentar
    return NextResponse.json(
      { ...comment, username: penulis.username },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error adding komentar:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
