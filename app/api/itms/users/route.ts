import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessItmsStaff } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

/** Lightweight user list for asset assignment pickers. */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItmsStaff(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const q = request.nextUrl.searchParams.get("q")?.trim()
    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { jabatan: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { username: "asc" },
      take: 50,
      select: {
        idUser: true,
        username: true,
        jabatan: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("ITMS users GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
