import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import {
  canAccessDanaUser,
  canHandleDanaWorkflow,
} from "@/lib/auth/permissions"
import {
  DANA_KEPERLUAN_MAX,
  DANA_NOMINAL_MAX,
  DANA_STATUS,
  isDanaCancellable,
  isDanaEditable,
} from "@/lib/dana/constants"
import { attachKembalian } from "@/lib/dana/hydrate"
import { toDanaPengajuan } from "@/lib/dana/map"
import type { AccessPrincipal } from "@/lib/auth/capabilities"

const updateSchema = z.object({
  action: z.enum(["cancel"]).optional(),
  nominal: z.number().int().positive().max(DANA_NOMINAL_MAX).optional(),
  keperluan: z.string().trim().min(3).max(DANA_KEPERLUAN_MAX).optional(),
})

function canRead(
  principal: AccessPrincipal,
  username: string,
  row: { username: string }
) {
  if (canHandleDanaWorkflow(principal)) return true
  return row.username === username
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessDanaUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const row = await prisma.danaPengajuan.findUnique({
      where: { idPengajuan: parseInt(id, 10) },
    })

    if (!row) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 })
    }

    if (!canRead(session.user, session.user.username, row)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [hydrated] = await attachKembalian([row])
    return NextResponse.json(toDanaPengajuan(hydrated))
  } catch (error) {
    console.error("Error fetching pengajuan dana:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessDanaUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idPengajuan = parseInt(id, 10)
    const existing = await prisma.danaPengajuan.findUnique({
      where: { idPengajuan },
    })

    if (!existing) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 })
    }

    if (existing.username !== session.user.username) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    if (data.action === "cancel") {
      if (!isDanaCancellable(existing.status)) {
        return NextResponse.json(
          { error: "Pengajuan hanya dapat dibatalkan selama status Pending" },
          { status: 400 }
        )
      }

      const updated = await prisma.danaPengajuan.update({
        where: { idPengajuan },
        data: { status: DANA_STATUS.CANCELLED },
      })
      return NextResponse.json(toDanaPengajuan(updated))
    }

    if (!isDanaEditable(existing.status)) {
      return NextResponse.json(
        { error: "Pengajuan yang sudah disetujui tidak dapat diubah" },
        { status: 400 }
      )
    }

    if (data.nominal === undefined && data.keperluan === undefined) {
      return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 })
    }

    const updated = await prisma.danaPengajuan.update({
      where: { idPengajuan },
      data: {
        ...(data.nominal !== undefined ? { nominal: data.nominal } : {}),
        ...(data.keperluan !== undefined ? { keperluan: data.keperluan } : {}),
        status: DANA_STATUS.PENDING,
        alasanTolak: null,
        disetujuiOleh: null,
        tglDisetujui: null,
        kembalian: 0,
      },
    })

    return NextResponse.json(toDanaPengajuan(updated))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating pengajuan dana:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
