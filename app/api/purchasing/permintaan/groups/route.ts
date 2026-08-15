import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canReadPurchasingTransactions,
  isClientUser,
} from "@/lib/auth/permissions"
import { fetchPermintaanGroups } from "@/lib/purchasing/permintaan-groups"
import {
  getDefaultPermintaanGroupDateRange,
  PERMINTAAN_GROUP_PAGE_SIZE,
} from "@/lib/purchasing/permintaan-group-types"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!canReadPurchasingTransactions(session.user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const defaults = getDefaultPermintaanGroupDateRange()
    const startDate = searchParams.get("start_date") ?? defaults.startDate
    const endDate = searchParams.get("end_date") ?? defaults.endDate
    const status = searchParams.get("status") ?? "all"
    const unit = searchParams.get("unit")
    const page = parseInt(searchParams.get("page") ?? "1", 10)

    const result = await fetchPermintaanGroups(
      {
        startDate,
        endDate,
        status: status === "all" ? null : status,
        unit,
        page: Number.isNaN(page) ? 1 : page,
        limit: PERMINTAAN_GROUP_PAGE_SIZE,
      },
      isClientUser(session.user)
        ? { unitOverride: session.user.username }
        : undefined
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching permintaan groups:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
