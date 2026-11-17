import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

const createSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activeOnly =
      request.nextUrl.searchParams.get("active") !== "false"

    const categories = await prisma.itmsCategory.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { name: "asc" },
      include: {
        parent: { select: { idCategory: true, name: true } },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("ITMS categories GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItmsStaff(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = createSchema.parse(await request.json())
    const category = await prisma.itmsCategory.create({
      data: {
        name: body.name,
        parentId: body.parentId ?? null,
        active: body.active ?? true,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS categories POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
