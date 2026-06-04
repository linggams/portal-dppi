import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import {
  canManageItTiket,
  canUserCancelTiket,
  IT_TIKET_STATUS,
} from "@/lib/it/constants"
import { z } from "zod"

const updateSchema = z.object({
  status: z.number().int().min(0).max(6).optional(),
  ditugaskanKe: z.string().max(20).nullable().optional(),
  action: z.enum(["assign_self", "confirm_done", "cancel"]).optional(),
})

async function getTiketOr404(id: number) {
  return prisma.itTiket.findUnique({
    where: { idTiket: id },
    include: {
      kategori: true,
      komentar: { orderBy: { tglDibuat: "asc" } },
    },
  })
}

function canAccessTiket(
  level: string,
  username: string,
  tiket: { username: string }
) {
  if (canManageItTiket(level)) return true
  return tiket.username === username
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const tiket = await getTiketOr404(parseInt(id))

    if (!tiket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (!canAccessTiket(session.user.level, session.user.username, tiket)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(tiket)
  } catch (error) {
    console.error("Error fetching it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
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
    const existing = await prisma.itTiket.findUnique({
      where: { idTiket: tiketId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    if (data.action === "confirm_done") {
      if (existing.username !== session.user.username) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (existing.status !== IT_TIKET_STATUS.MENUNGGU_USER) {
        return NextResponse.json(
          { error: "Tiket tidak menunggu konfirmasi" },
          { status: 400 }
        )
      }

      const updated = await prisma.$transaction(async (tx) => {
        const t = await tx.itTiket.update({
          where: { idTiket: tiketId },
          data: {
            status: IT_TIKET_STATUS.DITUTUP,
            tglSelesai: new Date(),
          },
          include: { kategori: true, komentar: true },
        })
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            username: session.user.username,
            pesan: "User mengonfirmasi tiket selesai",
            tipe: "status",
          },
        })
        return t
      })

      return NextResponse.json(updated)
    }

    if (data.action === "cancel") {
      if (existing.username !== session.user.username) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (!canUserCancelTiket(existing.status)) {
        return NextResponse.json(
          {
            error:
              "Tiket tidak dapat dibatalkan karena sudah diproses tim IT",
          },
          { status: 400 }
        )
      }

      const updated = await prisma.$transaction(async (tx) => {
        const t = await tx.itTiket.update({
          where: { idTiket: tiketId },
          data: { status: IT_TIKET_STATUS.DIBATALKAN },
          include: { kategori: true, komentar: true },
        })
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            username: session.user.username,
            pesan: "Tiket dibatalkan oleh pemohon",
            tipe: "status",
          },
        })
        return t
      })

      return NextResponse.json(updated)
    }

    if (!canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: {
      status?: number
      ditugaskanKe?: string | null
      tglSelesai?: Date | null
    } = {}

    let statusNote = ""

    if (data.action === "assign_self") {
      updateData.ditugaskanKe = session.user.username
      updateData.status = IT_TIKET_STATUS.DITUGASKAN
      statusNote = `Ditugaskan ke ${session.user.username}`
    }

    if (data.ditugaskanKe !== undefined) {
      updateData.ditugaskanKe = data.ditugaskanKe
      if (data.ditugaskanKe) {
        updateData.status = IT_TIKET_STATUS.DITUGASKAN
        statusNote = `Ditugaskan ke ${data.ditugaskanKe}`
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status
      statusNote = `Status diubah menjadi ${data.status}`
      if (
        data.status === IT_TIKET_STATUS.SELESAI ||
        data.status === IT_TIKET_STATUS.DITUTUP
      ) {
        updateData.tglSelesai = new Date()
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const t = await tx.itTiket.update({
        where: { idTiket: tiketId },
        data: updateData,
        include: {
          kategori: true,
          komentar: { orderBy: { tglDibuat: "asc" } },
        },
      })

      if (statusNote) {
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            username: session.user.username,
            pesan: statusNote,
            tipe: "status",
          },
        })
      }

      return t
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
