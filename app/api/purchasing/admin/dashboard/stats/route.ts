import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandlePurchasingWorkflow } from "@/lib/auth/permissions"
import { fetchPurchasingDashboardStats } from "@/lib/platform/fetch-dashboard-stats"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canHandlePurchasingWorkflow(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await fetchPurchasingDashboardStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching purchasing dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
