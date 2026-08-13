import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canHandleDanaWorkflow } from "@/lib/auth/permissions"
import { isDanaKembalianEditable } from "@/lib/dana/constants"
import { updateKembalianRaw } from "@/lib/dana/hydrate"
import { toDanaPengajuan } from "@/lib/dana/map"

const kembalianSchema = z.object({
  kembalian: z.number().int().min(0),
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
      return NextResponse.json(
        { error: "Pengajuan tidak ditemukan" },
        { status: 404 }
      )
    }

    if (!isDanaKembalianEditable(existing.status)) {
      return NextResponse.json(
        { error: "Kembalian hanya dapat diisi setelah pengajuan disetujui" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = kembalianSchema.parse(body)

    if (data.kembalian > existing.nominal) {
      return NextResponse.json(
        { error: "Kembalian tidak boleh melebihi nominal" },
        { status: 400 }
      )
    }

    await updateKembalianRaw(idPengajuan, data.kembalian)

    return NextResponse.json(
      toDanaPengajuan({
        ...existing,
        kembalian: data.kembalian,
        tglDiupdate: new Date(),
      })
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating kembalian:", error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
