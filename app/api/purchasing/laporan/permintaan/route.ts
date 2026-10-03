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

// GET - Laporan permintaan (only for admin)
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
    const status = searchParams.get("status")
    const { page, pageSize } = parsePaginationParams(searchParams)

    const where: {
      tglPermintaan?: {
        gte?: Date
        lte?: Date
      }
      pemohon?: { username: string }
      status?: number
    } = {}

    if (startDate && endDate) {
      where.tglPermintaan = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglPermintaan = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.tglPermintaan = {
        lte: new Date(endDate),
      }
    }

    if (unit) {
      where.pemohon = { username: unit }
    }

    if (status !== null) {
      where.status = parseInt(status)
    }

    const permintaan = await prisma.permintaan.findMany({
      where,
      include: {
        stokbarang: { include: { jenisBarang: true } },
        ...pemohonInclude,
      },
    })

    sortByKategoriThen(permintaan, "permintaan", (a, b) =>
      b.tglPermintaan.getTime() - a.tglPermintaan.getTime()
    )

    const totalJumlah = permintaan.reduce(
      (sum: number, item) => sum + item.jumlah,
      0
    )
    const totalItems = permintaan.length
    const pending = permintaan.filter((item) => item.status === 0).length
    const approved = permintaan.filter((item) => item.status === 1).length
    const rejected = permintaan.filter((item) => item.status === 2).length

    const paginated = paginateArray(permintaan.map(flattenActor), page, pageSize)

    return NextResponse.json({
      ...paginated,
      summary: {
        totalJumlah,
        totalItems,
        pending,
        approved,
        rejected,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
