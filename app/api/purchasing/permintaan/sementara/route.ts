import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { isClientUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  getTodayDateWIB,
  hasSubmittedPermintaanToday,
  parseDateOnly,
  PERMINTAAN_DAILY_LIMIT_MESSAGE,
} from "@/lib/purchasing/permintaan-daily-limit"
import { z } from "zod"
import { flattenActor, pemohonInclude, requireUserId } from "@/lib/purchasing/actor"

const sementaraSchema = z.object({
  unit: z.string().min(1).max(50),
  instansi: z.string().min(1).max(20),
  kodeBrg: z.string().min(1).max(7),
  idJenis: z.number().int(),
  jumlah: z.number().int().positive(),
})

// GET - List permintaan sementara (by unit and date)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const unit = searchParams.get("unit") || session.user.username
    const tglPermintaan =
      searchParams.get("tgl_permintaan") ?? getTodayDateWIB()

    const where: {
      pemohon: { username: string } | { idUser: number }
      tglPermintaan: Date
    } = {
      pemohon: { username: unit },
      tglPermintaan: parseDateOnly(tglPermintaan),
    }

    if (isClientUser(session.user)) {
      where.pemohon = { idUser: requireUserId(session.user.id) }
    }

    const sementara = await prisma.sementara.findMany({
      where,
      include: {
        stokbarang: true,
        ...pemohonInclude,
      },
      orderBy: {
        idSementara: "asc",
      },
    })

    return NextResponse.json(sementara.map(flattenActor))
  } catch (error) {
    console.error("Error fetching sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Add to sementara
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !isClientUser(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sementaraSchema.parse(body)

    // Check if user matches unit
    if (session.user.username !== validatedData.unit) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (await hasSubmittedPermintaanToday(validatedData.unit)) {
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

    const sementara = await prisma.sementara.create({
      data: {
        idUser: requireUserId(session.user.id),
        kodeBrg: validatedData.kodeBrg,
        jumlah: validatedData.jumlah,
        tglPermintaan: parseDateOnly(getTodayDateWIB()),
        status: 0,
      },
      include: {
        stokbarang: true,
        ...pemohonInclude,
      },
    })

    return NextResponse.json(flattenActor(sementara), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Remove from sementara
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !isClientUser(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      )
    }

    // Check if sementara belongs to user
    const sementara = await prisma.sementara.findUnique({
      where: { idSementara: parseInt(id) },
    })

    if (!sementara || sementara.idUser !== requireUserId(session.user.id)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.sementara.delete({
      where: { idSementara: parseInt(id) },
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error) {
    console.error("Error deleting sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
