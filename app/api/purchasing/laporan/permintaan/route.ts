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
    const status = searchParams.get("status")
    const { page, pageSize } = parsePaginationParams(searchParams)

    const where: {
      tglPermintaan?: { gte?: Date; lte?: Date }
      pemohon?: { username: string }
      status?: number
    } = {}

    if (startDate && endDate) {
      where.tglPermintaan = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.tglPermintaan = { gte: new Date(startDate) }
    } else if (endDate) {
      where.tglPermintaan = { lte: new Date(endDate) }
    }

    if (unit) {
      where.pemohon = { username: unit }
    }

    if (status !== null && status !== "" && status !== "all") {
      const parsed = Number.parseInt(status, 10)
      if (Number.isFinite(parsed)) where.status = parsed
    }

    const permintaan = await prisma.permintaan.findMany({
      where,
      include: {
        stokbarang: { include: { jenisBarang: true } },
        ...pemohonInclude,
      },
    })

    const flat = attachLaporanKeys(
      permintaan.map(flattenActor) as Record<string, unknown>[],
      "permintaan"
    )
    sortLaporanRows(flat, "permintaan", () => 0)

    const totalJumlah = flat.reduce(
      (sum, item) => sum + Number(item.jumlah ?? 0),
      0
    )
    const totalItems = flat.length
    const pending = flat.filter((item) => Number(item.status) === 0).length
    const approved = flat.filter((item) => Number(item.status) === 1).length
    const rejected = flat.filter((item) => Number(item.status) === 2).length

    const paginated = paginateByCompleteGroups(
      flat,
      "permintaan",
      page,
      pageSize
    )

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
