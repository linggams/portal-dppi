import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"
import { canManageItTiket } from "@/lib/it/constants"
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

    const onlyActive = request.nextUrl.searchParams.get("aktif") !== "false"

    const kategori = await prisma.itTiketKategori.findMany({
      where: onlyActive ? { aktif: true } : undefined,
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
    if (!session || !canManageItTiket(session.user.level)) {
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
