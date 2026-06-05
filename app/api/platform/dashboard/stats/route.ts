import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessPlatform } from "@/lib/auth/permissions"
import { fetchPlatformDashboardStats } from "@/lib/platform/fetch-dashboard-stats"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await fetchPlatformDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching platform dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
