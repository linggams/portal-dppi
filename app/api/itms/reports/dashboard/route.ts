import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessItmsStaff } from "@/lib/auth/permissions"
import { getItmsDashboardStats } from "@/lib/itms/reports"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItmsStaff(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const days = Number(request.nextUrl.searchParams.get("days") || "30")
    const stats = await getItmsDashboardStats({
      days: Number.isFinite(days) && days > 0 ? Math.min(days, 90) : 30,
    })
    return NextResponse.json(stats)
  } catch (error) {
    console.error("ITMS dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
