import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { parsePaginationParams } from "@/lib/shared/pagination"
import {
  attachLaporanKeys,
  paginateByCompleteGroups,
  sortLaporanRows,
} from "@/lib/purchasing/laporan-group"
import { flattenActor, pemohonInclude } from "@/lib/purchasing/actor"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const unit = searchParams.get("unit")
    const { page, pageSize } = parsePaginationParams(searchParams)

    const where: {
      tglMasuk?: { gte?: Date; lte?: Date }
      pemohon?: { username: string }
    } = {}

    if (startDate && endDate) {
      where.tglMasuk = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglMasuk = { gte: new Date(startDate) }
    } else if (endDate) {
      where.tglMasuk = { lte: new Date(endDate) }
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

    const flat = attachLaporanKeys(
      pemasukan.map(flattenActor) as Record<string, unknown>[],
      "pemasukan"
    )
    sortLaporanRows(flat, "pemasukan", () => 0)

    const totalJumlah = flat.reduce(
      (sum, item) => sum + Number(item.jumlah ?? 0),
      0
    )

    const paginated = paginateByCompleteGroups(
      flat,
      "pemasukan",
      page,
      pageSize
    )

    return NextResponse.json({
      ...paginated,
      summary: {
        totalJumlah,
        totalItems: flat.length,
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
