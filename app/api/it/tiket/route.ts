import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import {
  canAccessItUser,
  isClientUser,
} from "@/lib/auth/permissions"
import { canManageItTiket, IT_PRIORITAS } from "@/lib/it/constants"
import { generateNomorTiket } from "@/lib/it/nomor"
import { z } from "zod"

const createSchema = z.object({
  judul: z.string().min(3).max(200),
  deskripsi: z.string().min(5),
  idKategori: z.number().int().positive(),
  prioritas: z.enum(IT_PRIORITAS),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const mine = searchParams.get("mine") === "true"
    const assigned = searchParams.get("assigned")

    const where: {
      status?: number
      username?: string
      ditugaskanKe?: string
    } = {}

    if (status !== null && status !== "" && status !== "all") {
      where.status = parseInt(status)
    }

    if (
      !canAccessItUser(session.user.level) &&
      !canManageItTiket(session.user.level)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (isClientUser(session.user.level) || mine) {
      where.username = session.user.username
    }

    if (assigned) {
      where.ditugaskanKe = assigned
    }

    const tiket = await prisma.itTiket.findMany({
      where,
      include: { kategori: true },
      orderBy: [{ status: "asc" }, { tglDibuat: "desc" }],
    })

    return NextResponse.json(tiket)
  } catch (error) {
    console.error("Error fetching it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !isClientUser(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createSchema.parse(body)

    const nomorTiket = await generateNomorTiket()

    const tiket = await prisma.itTiket.create({
      data: {
        nomorTiket,
        username: session.user.username,
        jabatan: session.user.jabatan,
        judul: data.judul,
        deskripsi: data.deskripsi,
        idKategori: data.idKategori,
        prioritas: data.prioritas,
        status: 0,
      },
      include: { kategori: true },
    })

    await prisma.itTiketKomentar.create({
      data: {
        idTiket: tiket.idTiket,
        username: session.user.username,
        pesan: "Tiket dibuat",
        tipe: "sistem",
      },
    })

    return NextResponse.json(tiket, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
