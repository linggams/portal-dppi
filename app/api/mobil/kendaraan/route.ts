import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessMobil,
  canHandleMobilWorkflow,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { toMobilKendaraan } from "@/lib/mobil/map"

const schema = z.object({
  nopol: z.string().trim().min(3).max(20),
  idJenis: z.number().int().positive(),
  kmAwal: z.number().int().min(0).default(0),
  aktif: z.boolean().default(true),
})

const includeKendaraan = {
  jenis: { select: { idJenis: true, nama: true } },
  laporan: {
    orderBy: { tanggal: "desc" as const },
    take: 1,
    select: { kmAkhir: true },
  },
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const aktifOnly = request.nextUrl.searchParams.get("aktif") === "true"
    const rows = await prisma.mobilKendaraan.findMany({
      where: aktifOnly ? { aktif: true } : undefined,
      include: includeKendaraan,
      orderBy: { nopol: "asc" },
    })

    return NextResponse.json(rows.map(toMobilKendaraan))
  } catch (error) {
    console.error("Error fetching mobil kendaraan:", error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = schema.parse(await request.json())
    const existing = await prisma.mobilKendaraan.findUnique({
      where: { nopol: data.nopol },
    })
    if (existing) {
      return NextResponse.json({ error: "Nopol sudah terdaftar" }, { status: 400 })
    }

    const row = await prisma.mobilKendaraan.create({
      data: {
        nopol: data.nopol.toUpperCase(),
        idJenis: data.idJenis,
        kmAwal: data.kmAwal,
        aktif: data.aktif,
      },
      include: includeKendaraan,
    })

    return NextResponse.json(toMobilKendaraan(row), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating mobil kendaraan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
