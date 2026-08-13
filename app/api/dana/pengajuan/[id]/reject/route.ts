import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canHandleDanaWorkflow } from "@/lib/auth/permissions"
import {
  DANA_ALASAN_MAX,
  DANA_STATUS,
  isDanaApprovable,
} from "@/lib/dana/constants"
import { toDanaPengajuan } from "@/lib/dana/map"

const rejectSchema = z.object({
  alasan: z.string().trim().min(3).max(DANA_ALASAN_MAX),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleDanaWorkflow(session.user)) {
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

    if (!isDanaApprovable(existing.status)) {
      return NextResponse.json(
        { error: "Pengajuan sudah diproses" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = rejectSchema.parse(body)

    const updated = await prisma.danaPengajuan.update({
      where: { idPengajuan },
      data: {
        status: DANA_STATUS.REJECTED,
        alasanTolak: data.alasan,
        disetujuiOleh: null,
        tglDisetujui: null,
      },
    })

    return NextResponse.json(toDanaPengajuan(updated))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error rejecting pengajuan dana:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
