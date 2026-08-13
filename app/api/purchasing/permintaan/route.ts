import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

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

    const where: {
      status?: number
      unit?: string
      tglPermintaan?: Date
    } = {}
    if (status !== null) {
      where.status = parseInt(status)
    }
    if (unit) {
      where.unit = unit
    }
    if (tglPermintaan) {
      where.tglPermintaan = new Date(tglPermintaan)
    }

    // If user, only show their own requests
    if (isClientUser(session.user)) {
      where.unit = session.user.username
    }

    const permintaan = await prisma.permintaan.findMany({
      where,
      include: {
        stokbarang: true,
      },
      orderBy: {
        tglPermintaan: "desc",
      },
    })

    return NextResponse.json(permintaan)
  } catch (error) {
    console.error("Error fetching permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
