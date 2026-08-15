import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandleMobilWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  keterangan: z.string().trim().max(255).optional().default(""),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = schema.parse(await request.json())
    const row = await prisma.mobilJenis.update({
      where: { idJenis: parseInt(id, 10) },
      data: { nama: data.nama, keterangan: data.keterangan ?? "" },
    })
    return NextResponse.json(row)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating mobil jenis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(_request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idJenis = parseInt(id, 10)
    const used = await prisma.mobilKendaraan.count({ where: { idJenis } })
    if (used > 0) {
      return NextResponse.json(
        { error: "Jenis masih dipakai kendaraan" },
        { status: 400 }
      )
    }

    await prisma.mobilJenis.delete({ where: { idJenis } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting mobil jenis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
