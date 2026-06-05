import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { isClientUser } from "@/lib/auth/permissions"
import { getPermintaanDailyLimitStatus } from "@/lib/purchasing/permintaan-daily-limit"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !isClientUser(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const unit = searchParams.get("unit") ?? session.user.username

    if (unit !== session.user.username) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const status = await getPermintaanDailyLimitStatus(unit)
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking permintaan daily limit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
