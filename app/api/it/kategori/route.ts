import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canManageItTiket } from "@/lib/it/constants"
import {
  parsePaginationParams,
  toPaginatedResult,
  wantsPagination,
} from "@/lib/shared/pagination"
import { z } from "zod"

const kategoriSchema = z.object({
  nama: z.string().min(1).max(100),
  aktif: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const onlyActive = searchParams.get("aktif") !== "false"
    const where = onlyActive ? { aktif: true } : undefined

    if (wantsPagination(searchParams)) {
      const { page, pageSize, skip } = parsePaginationParams(searchParams)
      const [total, kategori] = await Promise.all([
        prisma.itTiketKategori.count({ where }),
        prisma.itTiketKategori.findMany({
          where,
          orderBy: { nama: "asc" },
          skip,
          take: pageSize,
        }),
      ])
      return NextResponse.json(
        toPaginatedResult(kategori, total, page, pageSize)
      )
    }

    const kategori = await prisma.itTiketKategori.findMany({
      where,
      orderBy: { nama: "asc" },
    })

    return NextResponse.json(kategori)
  } catch (error) {
    console.error("Error fetching it kategori:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = kategoriSchema.parse(body)

    const kategori = await prisma.itTiketKategori.create({
      data: {
        nama: data.nama,
        aktif: data.aktif ?? true,
      },
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating it kategori:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
