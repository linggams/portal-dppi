import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  paginateArray,
  parsePaginationParams,
} from "@/lib/shared/pagination"
import { sortByKategoriThen } from "@/lib/purchasing/laporan-group"
import { flattenActor, pemohonInclude } from "@/lib/purchasing/actor"

// GET - Laporan pemasukan (only for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const unit = searchParams.get("unit")
    const { page, pageSize } = parsePaginationParams(searchParams)

    const where: {
      tglMasuk?: {
        gte?: Date
        lte?: Date
      }
      pemohon?: { username: string }
    } = {}

    if (startDate && endDate) {
      where.tglMasuk = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglMasuk = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.tglMasuk = {
        lte: new Date(endDate),
      }
    }

    if (unit) {
      where.pemohon = { username: unit }
    }

    const pemasukan = await prisma.pemasukan.findMany({
      where,
      include: {
        stokbarang: { include: { jenisBarang: true } },
        ...pemohonInclude,
      },
    })

    sortByKategoriThen(pemasukan, "pemasukan", (a, b) =>
      b.tglMasuk.getTime() - a.tglMasuk.getTime()
    )

    const totalJumlah = pemasukan.reduce(
      (sum: number, item) => sum + item.jumlah,
      0
    )
    const totalItems = pemasukan.length

    const paginated = paginateArray(pemasukan.map(flattenActor), page, pageSize)

    return NextResponse.json({
      ...paginated,
      summary: {
        totalJumlah,
        totalItems,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan pemasukan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
