import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  parsePaginationParams,
  toPaginatedResult,
  wantsPagination,
} from "@/lib/shared/pagination"
import { flattenActor, pemohonInclude, requireUserId } from "@/lib/purchasing/actor"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!canReadPurchasingTransactions(session.user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const unit = searchParams.get("unit")
    const tglPermintaan = searchParams.get("tgl_permintaan")
    const paginate = wantsPagination(searchParams)

    const where: {
      status?: number
      pemohon?: { idUser: number } | { username: string }
      tglPermintaan?: Date
    } = {}
    if (status !== null) {
      where.status = parseInt(status)
    }
    if (unit) {
      where.pemohon = { username: unit }
    }
    if (tglPermintaan) {
      where.tglPermintaan = new Date(tglPermintaan)
    }

    if (isClientUser(session.user)) {
      where.pemohon = { idUser: requireUserId(session.user.id) }
    }

    if (paginate) {
      const { page, pageSize, skip } = parsePaginationParams(searchParams)
      const [total, permintaan] = await Promise.all([
        prisma.permintaan.count({ where }),
        prisma.permintaan.findMany({
          where,
          include: { stokbarang: true, ...pemohonInclude },
          orderBy: { tglPermintaan: "desc" },
          skip,
          take: pageSize,
        }),
      ])
      return NextResponse.json(
        toPaginatedResult(permintaan.map(flattenActor), total, page, pageSize)
      )
    }

    const permintaan = await prisma.permintaan.findMany({
      where,
      include: {
        stokbarang: true,
        ...pemohonInclude,
      },
      orderBy: {
        tglPermintaan: "desc",
      },
    })

    return NextResponse.json(permintaan.map(flattenActor))
  } catch (error) {
    console.error("Error fetching permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
