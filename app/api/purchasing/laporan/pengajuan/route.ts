import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// GET - Laporan pengajuan (only for admin)
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
    const status = searchParams.get("status")

    const where: {
      tglPengajuan?: {
        gte?: Date
        lte?: Date
      }
      unit?: string
      status?: number
    } = {}

    if (startDate && endDate) {
      where.tglPengajuan = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglPengajuan = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.tglPengajuan = {
        lte: new Date(endDate),
      }
    }

    if (unit) {
      where.unit = unit
    }

    if (status !== null) {
      where.status = parseInt(status)
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

    // Calculate summary
    const totalJumlah = pengajuan.reduce(
      (sum: number, item) => sum + item.jumlah,
      0
    )
    const totalHarga = pengajuan.reduce(
      (sum: number, item) => sum + item.total,
      0
    )
    const totalItems = pengajuan.length
    const pending = pengajuan.filter((item) => item.status === 0).length
    const approved = pengajuan.filter((item) => item.status === 1).length
    const rejected = pengajuan.filter((item) => item.status === 2).length

    return NextResponse.json({
      data: pengajuan,
      summary: {
        totalJumlah,
        totalHarga,
        totalItems,
        pending,
        approved,
        rejected,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
