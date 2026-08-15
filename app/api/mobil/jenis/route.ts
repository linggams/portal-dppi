import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandleMobilWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  keterangan: z.string().trim().max(255).optional().default(""),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await prisma.mobilJenis.findMany({ orderBy: { nama: "asc" } })
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching mobil jenis:", error)
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
    const row = await prisma.mobilJenis.create({
      data: { nama: data.nama, keterangan: data.keterangan ?? "" },
    })
    return NextResponse.json(row, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating mobil jenis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
