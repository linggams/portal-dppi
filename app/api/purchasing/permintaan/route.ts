import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  getTodayDateWIB,
  hasSubmittedPermintaanToday,
  parseDateOnly,
  PERMINTAAN_DAILY_LIMIT_MESSAGE,
} from "@/lib/purchasing/permintaan-daily-limit"
import { z } from "zod"

const permintaanSchema = z.object({
  unit: z.string().min(1).max(20),
  instansi: z.string().min(1).max(20),
  kodeBrg: z.string().min(1).max(7),
  idJenis: z.number().int(),
  jumlah: z.number().int().positive(),
})

// GET - List permintaan (filter by status, unit, etc)
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
    const tglPermintaan = searchParams.get("tgl_permintaan")

    const where: {
      status?: number
      unit?: string
      tglPermintaan?: Date
    } = {}
    if (status !== null) {
      where.status = parseInt(status)
    }
    if (unit) {
      where.unit = unit
    }
    if (tglPermintaan) {
      where.tglPermintaan = new Date(tglPermintaan)
    }

    // If user, only show their own requests
    if (isClientUser(session.user.level)) {
      where.unit = session.user.username
    }

    const permintaan = await prisma.permintaan.findMany({
      where,
      include: {
        stokbarang: true,
      },
      orderBy: {
        tglPermintaan: "desc",
      },
    })

    return NextResponse.json(permintaan)
  } catch (error) {
    console.error("Error fetching permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create permintaan (from sementara)
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
    const validatedData = permintaanSchema.parse(body)

    // Check if user is user and matches unit
    if (
      isClientUser(session.user.level) &&
      session.user.username !== validatedData.unit
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (
      isClientUser(session.user.level) &&
      (await hasSubmittedPermintaanToday(validatedData.unit))
    ) {
      return NextResponse.json(
        { error: PERMINTAAN_DAILY_LIMIT_MESSAGE },
        { status: 409 }
      )
    }

    // Check stok availability
    const stokBarang = await prisma.stokbarang.findUnique({
      where: { kodeBrg: validatedData.kodeBrg },
    })

    if (!stokBarang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      )
    }

    if (stokBarang.sisa < validatedData.jumlah) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Stok tersedia: ${stokBarang.sisa}` },
        { status: 400 }
      )
    }

    const permintaan = await prisma.permintaan.create({
      data: {
        unit: validatedData.unit,
        user: validatedData.instansi,
        kodeBrg: validatedData.kodeBrg,
        idJenis: validatedData.idJenis,
        jumlah: validatedData.jumlah,
        tglPermintaan: parseDateOnly(getTodayDateWIB()),
        status: 0, // Pending
      },
      include: {
        stokbarang: true,
      },
    })

    return NextResponse.json(permintaan, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
