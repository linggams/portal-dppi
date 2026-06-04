import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { isClientUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const sementaraSchema = z.object({
  unit: z.string().min(1).max(20),
  kodeBrg: z.string().min(1).max(7),
  idJenis: z.number().int(),
  jumlah: z.number().int().positive(),
  satuan: z.string().min(1).max(20),
  hargabarang: z.number().positive(),
  total: z.number().positive(),
})

// GET - List pengajuan sementara (by unit and date)
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
    const tglPengajuan =
      searchParams.get("tgl_pengajuan") ||
      new Date().toISOString().split("T")[0]

    const where: {
      unit: string
      tglPengajuan: Date
    } = {
      unit,
      tglPengajuan: new Date(tglPengajuan),
    }

    // If user, only show their own
    if (isClientUser(session.user.level)) {
      where.unit = session.user.username
    }

    const sementara = await prisma.pengajuanSementara.findMany({
      where,
      include: {
        stokbarang: true,
      },
      orderBy: {
        idPengajuanSementara: "asc",
      },
    })

    return NextResponse.json(sementara)
  } catch (error) {
    console.error("Error fetching pengajuan sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Add to pengajuan_sementara
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
    const validatedData = sementaraSchema.parse(body)

    // Check if user matches unit
    if (session.user.username !== validatedData.unit) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if barang exists
    const stokBarang = await prisma.stokbarang.findUnique({
      where: { kodeBrg: validatedData.kodeBrg },
    })

    if (!stokBarang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 }
      )
    }

    const sementara = await prisma.pengajuanSementara.create({
      data: {
        unit: validatedData.unit,
        kodeBrg: validatedData.kodeBrg,
        idJenis: validatedData.idJenis,
        jumlah: validatedData.jumlah,
        satuan: validatedData.satuan,
        hargabarang: validatedData.hargabarang,
        total: validatedData.total,
        tglPengajuan: new Date(),
        status: 0,
      },
      include: {
        stokbarang: true,
      },
    })

    return NextResponse.json(sementara, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating pengajuan sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Remove from pengajuan_sementara
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
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
    const sementara = await prisma.pengajuanSementara.findUnique({
      where: { idPengajuanSementara: parseInt(id) },
    })

    if (!sementara || sementara.unit !== session.user.username) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.pengajuanSementara.delete({
      where: { idPengajuanSementara: parseInt(id) },
    })

    return NextResponse.json({ message: "Deleted successfully" })
  } catch (error) {
    console.error("Error deleting pengajuan sementara:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
