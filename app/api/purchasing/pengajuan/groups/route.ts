import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { fetchPengajuanGroups } from "@/lib/purchasing/pengajuan-groups"
import { getDefaultPengajuanGroupDateRange } from "@/lib/purchasing/pengajuan-group-types"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!canReadPurchasingTransactions(session.user.level)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const defaults = getDefaultPengajuanGroupDateRange()
    const startDate = searchParams.get("start_date") ?? defaults.startDate
    const endDate = searchParams.get("end_date") ?? defaults.endDate
    const status = searchParams.get("status") ?? "all"
    const unit = searchParams.get("unit")
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const limit = parseInt(searchParams.get("limit") ?? "20", 10)

    const result = await fetchPengajuanGroups(
      {
        startDate,
        endDate,
        status: status === "all" ? null : status,
        unit,
        page: Number.isNaN(page) ? 1 : page,
        limit: Number.isNaN(limit) ? 20 : limit,
      },
      isClientUser(session.user.level)
        ? { unitOverride: session.user.username }
        : undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching pengajuan groups:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
