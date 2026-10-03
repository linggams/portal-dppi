import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import {
  canManageItTiket,
  canUserCancelTiket,
  IT_TIKET_STATUS,
  IT_TIKET_STATUS_LABEL,
} from "@/lib/it/constants"
import type { AccessPrincipal } from "@/lib/auth/capabilities"
import { z } from "zod"
import { flattenTiket, tiketActorInclude } from "@/lib/it/tiket-view"
import { requireUserId } from "@/lib/purchasing/actor"

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
      ...tiketActorInclude,
      komentar: {
        orderBy: { tglDibuat: "asc" as const },
        include: { penulis: { select: { username: true } } },
      },
    },
  })
}

function canAccessTiket(
  principal: AccessPrincipal,
  username: string,
  tiket: { idPemohon: number }
) {
  if (canManageItTiket(principal)) return true
  return tiket.idPemohon === Number.parseInt(username, 10)
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

    if (!canAccessTiket(session.user, session.user.id, tiket)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(flattenTiket(tiket))
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
      if (existing.idPemohon !== requireUserId(session.user.id)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (existing.status !== IT_TIKET_STATUS.MENUNGGU_USER) {
        return NextResponse.json(
          { error: "Tiket tidak menunggu konfirmasi" },
          { status: 400 }
        )
      }

      const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const t = await tx.itTiket.update({
          where: { idTiket: tiketId },
          data: {
            status: IT_TIKET_STATUS.DITUTUP,
            tglSelesai: new Date(),
          },
          include: {
            kategori: true,
            ...tiketActorInclude,
            komentar: {
              include: { penulis: { select: { username: true } } },
            },
          },
        })
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            idUser: requireUserId(session.user.id),
            pesan: "User mengonfirmasi tiket selesai",
            tipe: "status",
          },
        })
        return t
      })

      return NextResponse.json(flattenTiket(updated))
    }

    if (data.action === "cancel") {
      if (existing.idPemohon !== requireUserId(session.user.id)) {
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

      const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const t = await tx.itTiket.update({
          where: { idTiket: tiketId },
          data: { status: IT_TIKET_STATUS.DIBATALKAN },
          include: {
            kategori: true,
            ...tiketActorInclude,
            komentar: {
              include: { penulis: { select: { username: true } } },
            },
          },
        })
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            idUser: requireUserId(session.user.id),
            pesan: "Tiket dibatalkan oleh pemohon",
            tipe: "status",
          },
        })
        return t
      })

      return NextResponse.json(flattenTiket(updated))
    }

    if (!canManageItTiket(session.user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: {
      status?: number
      idPetugas?: number | null
      tglSelesai?: Date | null
    } = {}

    let statusNote = ""

    if (data.action === "assign_self") {
      updateData.idPetugas = requireUserId(session.user.id)
      updateData.status = IT_TIKET_STATUS.DITUGASKAN
      statusNote = `Ditugaskan ke ${session.user.username}`
    }

    if (data.ditugaskanKe !== undefined) {
      if (!data.ditugaskanKe) {
        updateData.idPetugas = null
      } else {
        const petugas = await prisma.user.findUnique({
          where: { username: data.ditugaskanKe },
          select: { idUser: true },
        })
        if (!petugas) {
          return NextResponse.json(
            { error: "Petugas tidak ditemukan" },
            { status: 400 }
          )
        }
        updateData.idPetugas = petugas.idUser
        updateData.status = IT_TIKET_STATUS.DITUGASKAN
        statusNote = `Ditugaskan ke ${data.ditugaskanKe}`
      }
    }

    if (data.status !== undefined) {
      updateData.status = data.status
      const statusLabel =
        IT_TIKET_STATUS_LABEL[data.status] ?? String(data.status)
      statusNote = `Status diubah menjadi ${statusLabel}`
      if (
        data.status === IT_TIKET_STATUS.SELESAI ||
        data.status === IT_TIKET_STATUS.DITUTUP
      ) {
        updateData.tglSelesai = new Date()
      }
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const t = await tx.itTiket.update({
        where: { idTiket: tiketId },
        data: updateData,
        include: {
          kategori: true,
          ...tiketActorInclude,
          komentar: {
            orderBy: { tglDibuat: "asc" as const },
            include: { penulis: { select: { username: true } } },
          },
        },
      })

      if (statusNote) {
        await tx.itTiketKomentar.create({
          data: {
            idTiket: tiketId,
            idUser: requireUserId(session.user.id),
            pesan: statusNote,
            tipe: "status",
          },
        })
      }

      return t
    })

    return NextResponse.json(flattenTiket(updated))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
