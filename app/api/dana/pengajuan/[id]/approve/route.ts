import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canHandleDanaWorkflow } from "@/lib/auth/permissions"
import { DANA_STATUS, isDanaApprovable } from "@/lib/dana/constants"
import { toDanaPengajuan } from "@/lib/dana/map"

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

    const updated = await prisma.danaPengajuan.update({
      where: { idPengajuan },
      data: {
        status: DANA_STATUS.APPROVED,
        disetujuiOleh: session.user.username,
        tglDisetujui: new Date(),
        alasanTolak: null,
      },
    })

    return NextResponse.json(toDanaPengajuan(updated))
  } catch (error) {
    console.error("Error approving pengajuan dana:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
