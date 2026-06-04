import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { isClientUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// POST - Submit semua permintaan sementara menjadi permintaan
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !isClientUser(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { unit, tglPermintaan } = body

    if (session.user.username !== unit) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all sementara for this unit and date
    const sementaraList = await prisma.sementara.findMany({
      where: {
        unit,
        tglPermintaan: new Date(tglPermintaan),
        status: 0,
      },
      include: {
        stokbarang: true,
      },
    })

    if (sementaraList.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada permintaan untuk disubmit" },
        { status: 400 }
      )
    }

    // Check all stok availability
    for (const item of sementaraList) {
      if (item.stokbarang.sisa < item.jumlah) {
        return NextResponse.json(
          { error: `Stok ${item.stokbarang.namaBrg} tidak mencukupi. Stok tersedia: ${item.stokbarang.sisa}` },
          { status: 400 }
        )
      }
    }

    // Create permintaan for each item
    const permintaanList = []
    for (const item of sementaraList) {
      const permintaan = await prisma.permintaan.create({
        data: {
          unit: item.unit,
          user: item.user,
          kodeBrg: item.kodeBrg,
          idJenis: item.idJenis,
          jumlah: item.jumlah,
          tglPermintaan: item.tglPermintaan,
          status: 0, // Pending
        },
        include: {
          stokbarang: true,
        },
      })
      permintaanList.push(permintaan)
    }

    // Delete all sementara
    await prisma.sementara.deleteMany({
      where: {
        unit,
        tglPermintaan: new Date(tglPermintaan),
        status: 0,
      },
    })

    return NextResponse.json({
      message: "Permintaan berhasil disubmit",
      count: permintaanList.length,
      data: permintaanList,
    })
  } catch (error) {
    console.error("Error submitting permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
