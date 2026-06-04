import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// GET - Laporan pengeluaran (only for admin)
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
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const unit = searchParams.get("unit")

    const where: {
      tglKeluar?: {
        gte?: Date
        lte?: Date
      }
      unit?: string
    } = {}

    if (startDate && endDate) {
      where.tglKeluar = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglKeluar = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.tglKeluar = {
        lte: new Date(endDate),
      }
    }

    if (unit) {
      where.unit = unit
    }

    const pengeluaran = await prisma.pengeluaran.findMany({
      where,
      include: {
        stokbarang: true,
      },
      orderBy: {
        tglKeluar: "desc",
      },
    })

    // Calculate summary
    const totalJumlah = pengeluaran.reduce(
      (sum: number, item) => sum + item.jumlah,
      0
    )
    const totalItems = pengeluaran.length

    return NextResponse.json({
      data: pengeluaran,
      summary: {
        totalJumlah,
        totalItems,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan pengeluaran:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
