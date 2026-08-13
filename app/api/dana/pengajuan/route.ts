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
} from "@/lib/dana/constants"
import { generateNomorPengajuanDana } from "@/lib/dana/nomor"
import { attachKembalian } from "@/lib/dana/hydrate"
import { toDanaPengajuan } from "@/lib/dana/map"

const createSchema = z.object({
  nominal: z.number().int().positive().max(DANA_NOMINAL_MAX),
  keperluan: z.string().trim().min(3).max(DANA_KEPERLUAN_MAX),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessDanaUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const mine = searchParams.get("mine") === "true"
    const q = searchParams.get("q")?.trim() ?? ""

    const where: {
      status?: number
      username?: string
      OR?: Array<
        | { nomor: { contains: string; mode: "insensitive" } }
        | { keperluan: { contains: string; mode: "insensitive" } }
        | { username: { contains: string; mode: "insensitive" } }
      >
    } = {}

    if (status !== null && status !== "" && status !== "all") {
      const parsed = parseInt(status, 10)
      if (!Number.isNaN(parsed)) where.status = parsed
    }

    if (!canHandleDanaWorkflow(session.user) || mine) {
      where.username = session.user.username
    }

    if (q) {
      where.OR = [
        { nomor: { contains: q, mode: "insensitive" } },
        { keperluan: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
      ]
    }

    const rows = await prisma.danaPengajuan.findMany({
      where,
      orderBy: [{ status: "asc" }, { tglDibuat: "desc" }],
    })

    const hydrated = await attachKembalian(rows)
    return NextResponse.json(hydrated.map(toDanaPengajuan))
  } catch (error) {
    console.error("Error fetching pengajuan dana:", error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessDanaUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createSchema.parse(body)
    const nomor = await generateNomorPengajuanDana()

    const row = await prisma.danaPengajuan.create({
      data: {
        nomor,
        username: session.user.username,
        jabatan: session.user.jabatan,
        nominal: data.nominal,
        keperluan: data.keperluan,
        status: DANA_STATUS.PENDING,
      },
    })

    return NextResponse.json(toDanaPengajuan(row), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating pengajuan dana:", error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
