import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canAccessItUser } from "@/lib/auth/permissions"
import { canManageItTiket } from "@/lib/it/constants"
import { generateNomorTiket } from "@/lib/it/nomor"
import {
  parsePaginationParams,
  toPaginatedResult,
} from "@/lib/shared/pagination"
import { z } from "zod"
import { flattenTiket, tiketActorInclude } from "@/lib/it/tiket-view"
import { requireUserId } from "@/lib/purchasing/actor"

const createSchema = z.object({
  judul: z.string().min(3).max(200),
  deskripsi: z.string().min(5),
  idKategori: z.number().int().positive(),
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
    const { page, pageSize, skip } = parsePaginationParams(searchParams)

    const where: {
      status?: number
      idPemohon?: number
    } = {}

    if (status !== null && status !== "" && status !== "all") {
      where.status = parseInt(status)
    }

    if (
      !canAccessItUser(session.user) &&
      !canManageItTiket(session.user)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!canManageItTiket(session.user) || mine) {
      where.idPemohon = requireUserId(session.user.id)
    }

    const [total, tiket] = await Promise.all([
      prisma.itTiket.count({ where }),
      prisma.itTiket.findMany({
        where,
        include: { kategori: true, ...tiketActorInclude },
        orderBy: [{ status: "asc" }, { tglDibuat: "desc" }],
        skip,
        take: pageSize,
      }),
    ])

    return NextResponse.json(
      toPaginatedResult(tiket.map(flattenTiket), total, page, pageSize)
    )
  } catch (error) {
    console.error("Error fetching it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createSchema.parse(body)

    const nomorTiket = await generateNomorTiket()

    const tiket = await prisma.itTiket.create({
      data: {
        nomorTiket,
        idPemohon: requireUserId(session.user.id),
        judul: data.judul,
        deskripsi: data.deskripsi,
        idKategori: data.idKategori,
        status: 0,
      },
      include: { kategori: true, ...tiketActorInclude },
    })

    await prisma.itTiketKomentar.create({
      data: {
        idTiket: tiket.idTiket,
        idUser: requireUserId(session.user.id),
        pesan: "Tiket dibuat",
        tipe: "sistem",
      },
    })

    return NextResponse.json(flattenTiket(tiket), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating it tiket:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
