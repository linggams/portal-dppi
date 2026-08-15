import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandleMobilWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { toMobilKendaraan } from "@/lib/mobil/map"

const schema = z.object({
  nopol: z.string().trim().min(3).max(20),
  idJenis: z.number().int().positive(),
  kmAwal: z.number().int().min(0),
  aktif: z.boolean(),
})

const includeKendaraan = {
  jenis: { select: { idJenis: true, nama: true } },
  laporan: {
    orderBy: { tanggal: "desc" as const },
    take: 1,
    select: { kmAkhir: true },
  },
}

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
    const idKendaraan = parseInt(id, 10)
    const data = schema.parse(await request.json())

    const duplicate = await prisma.mobilKendaraan.findFirst({
      where: {
        nopol: data.nopol.toUpperCase(),
        NOT: { idKendaraan },
      },
    })
    if (duplicate) {
      return NextResponse.json({ error: "Nopol sudah terdaftar" }, { status: 400 })
    }

    const row = await prisma.mobilKendaraan.update({
      where: { idKendaraan },
      data: {
        nopol: data.nopol.toUpperCase(),
        idJenis: data.idJenis,
        kmAwal: data.kmAwal,
        aktif: data.aktif,
      },
      include: includeKendaraan,
    })

    return NextResponse.json(toMobilKendaraan(row))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error updating mobil kendaraan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idKendaraan = parseInt(id, 10)
    const used = await prisma.mobilLaporanKm.count({ where: { idKendaraan } })
    if (used > 0) {
      return NextResponse.json(
        { error: "Kendaraan masih punya laporan KM" },
        { status: 400 }
      )
    }

    await prisma.mobilKendaraan.delete({ where: { idKendaraan } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting mobil kendaraan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
