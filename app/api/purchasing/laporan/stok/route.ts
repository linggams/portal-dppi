import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// GET - Laporan stok (only for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const idJenis = searchParams.get("id_jenis")
    const minStok = searchParams.get("min_stok")

    const where: {
      idJenis?: number
      sisa?: {
        lte?: number
      }
    } = {}

    if (idJenis) {
      where.idJenis = parseInt(idJenis)
    }

    if (minStok) {
      where.sisa = {
        lte: parseInt(minStok),
      }
    }

    const stok = await prisma.stokbarang.findMany({
      where,
      orderBy: {
        namaBrg: "asc",
      },
    })

    // Calculate summary
    const totalStok = stok.reduce((sum: number, item) => sum + item.stok, 0)
    const totalSisa = stok.reduce((sum: number, item) => sum + item.sisa, 0)
    const totalKeluar = stok.reduce(
      (sum: number, item) => sum + item.keluar,
      0
    )
    const lowStock = stok.filter((item) => item.sisa <= 10).length

    return NextResponse.json({
      data: stok,
      summary: {
        totalStok,
        totalSisa,
        totalKeluar,
        lowStock,
        totalItems: stok.length,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan stok:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
