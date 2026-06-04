import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canManageItTiket } from "@/lib/it/constants"
import { z } from "zod"

const updateSchema = z.object({
  nama: z.string().min(1).max(100).optional(),
  aktif: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateSchema.parse(body)

    const kategori = await prisma.itTiketKategori.update({
      where: { idKategori: parseInt(id) },
      data,
    })

    return NextResponse.json(kategori)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating it kategori:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.itTiketKategori.update({
      where: { idKategori: parseInt(id) },
      data: { aktif: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting it kategori:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
