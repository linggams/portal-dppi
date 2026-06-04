import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const pengajuanSchema = z.object({
  unit: z.string().min(1).max(20),
  kodeBrg: z.string().min(1).max(7),
  idJenis: z.number().int(),
  jumlah: z.number().int().positive(),
  satuan: z.string().min(1).max(11),
  hargabarang: z.number().positive(),
  total: z.number().positive(),
})

// GET - List pengajuan (filter by status, unit, etc)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!canReadPurchasingTransactions(session.user.level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const unit = searchParams.get("unit")
    const tglPengajuan = searchParams.get("tgl_pengajuan")

    const where: {
      status?: number
      unit?: string
      tglPengajuan?: Date
    } = {}
    if (status !== null) {
      where.status = parseInt(status)
    }
    if (unit) {
      where.unit = unit
    }
    if (tglPengajuan) {
      where.tglPengajuan = new Date(tglPengajuan)
    }

    // If admin, can see all. If user, only their own
    if (isClientUser(session.user.level)) {
      where.unit = session.user.username
    }

    const pengajuan = await prisma.pengajuan.findMany({
      where,
      include: {
        stokbarang: true,
      },
      orderBy: {
        tglPengajuan: "desc",
      },
    })

    return NextResponse.json(pengajuan)
  } catch (error) {
    console.error("Error fetching pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create pengajuan (from pengajuan_sementara)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = pengajuanSchema.parse(body)

    // Check if user matches unit (for user) or is admin
    if (
      isClientUser(session.user.level) &&
      session.user.username !== validatedData.unit
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const pengajuan = await prisma.pengajuan.create({
      data: {
        unit: validatedData.unit,
        kodeBrg: validatedData.kodeBrg,
        idJenis: validatedData.idJenis,
        jumlah: validatedData.jumlah,
        satuan: validatedData.satuan,
        hargabarang: validatedData.hargabarang,
        total: validatedData.total,
        tglPengajuan: new Date(),
        status: 0, // Pending
      },
      include: {
        stokbarang: true,
      },
    })

    return NextResponse.json(pengajuan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
