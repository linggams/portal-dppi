import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessPlatform } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { toRoleListItem } from "@/lib/platform/map-role"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessPlatform(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      where: { code: { in: ["user", "administrator"] } },
      include: { _count: { select: { users: true } } },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(roles.map(toRoleListItem))
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
