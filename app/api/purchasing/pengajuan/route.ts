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
    const tglPengajuan = searchParams.get("tgl_pengajuan")

    const where: {
      status?: number
      unit?: string
      tglPengajuan?: Date
    } = {}
    if (status !== null) {
      where.status = parseInt(status)
    }
    if (unit) {
      where.unit = unit
    }
    if (tglPengajuan) {
      where.tglPengajuan = new Date(tglPengajuan)
    }

    // If admin, can see all. If user, only their own
    if (isClientUser(session.user)) {
      where.unit = session.user.username
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

    return NextResponse.json(pengajuan)
  } catch (error) {
    console.error("Error fetching pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
