import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Prisma } from "@prisma/client"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  parsePaginationParams,
  toPaginatedResult,
} from "@/lib/shared/pagination"

const createSchema = z.object({
  kind: z.literal("sop").default("sop"),
  title: z.string().min(3).max(200),
  body: z.string().min(1),
  changeNote: z.string().max(255).optional(),
  visibility: z.enum(["internal_all", "it_only"]).optional(),
  tags: z.string().max(255).optional(),
  number: z.string().max(40).optional(),
  effectiveDate: z.string().optional().nullable(),
  nextReviewAt: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const { page, pageSize, skip } = parsePaginationParams(params)
    const isStaff = canAccessItmsStaff(session.user)
    const q = params.get("q")?.trim()
    const status = params.get("status")
    const publishedOnly = params.get("published") === "true" || !isStaff

    const where: Prisma.ItmsKbDocumentWhereInput = {
      kind: "sop",
    }

    if (publishedOnly) {
      where.status = "published"
      if (!isStaff) where.visibility = "internal_all"
    } else if (status) {
      where.status = status as Prisma.EnumItmsKbStatusFilter["equals"]
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
        { number: { contains: q, mode: "insensitive" } },
      ]
    }

    const [total, documents] = await Promise.all([
      prisma.itmsKbDocument.count({ where }),
      prisma.itmsKbDocument.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: {
          owner: { select: { idUser: true, username: true } },
          currentVersion: {
            select: {
              idVersion: true,
              version: true,
              createdAt: true,
              changeNote: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json(
      toPaginatedResult(documents, total, page, pageSize)
    )
  } catch (error) {
    console.error("ITMS knowledge GET:", error)
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
    const userId = Number(session.user.id)

    let number = body.number?.trim() || null
    if (!number) {
      const year = new Date().getFullYear()
      const prefix = `SOP-IT-${year}-`
      const count = await prisma.itmsKbDocument.count({
        where: { number: { startsWith: prefix } },
      })
      number = `${prefix}${String(count + 1).padStart(3, "0")}`
    }

    const document = await prisma.$transaction(async (tx) => {
      const doc = await tx.itmsKbDocument.create({
        data: {
          kind: "sop",
          number,
          title: body.title,
          idOwner: userId,
          status: "draft",
          visibility: body.visibility ?? "internal_all",
          tags: body.tags ?? "",
          effectiveDate: body.effectiveDate
            ? new Date(body.effectiveDate)
            : null,
          nextReviewAt: body.nextReviewAt ? new Date(body.nextReviewAt) : null,
        },
      })

      const version = await tx.itmsKbVersion.create({
        data: {
          idDocument: doc.idDocument,
          version: 1,
          body: body.body,
          changeNote: body.changeNote ?? "Initial draft",
          idAuthor: userId,
        },
      })

      return tx.itmsKbDocument.update({
        where: { idDocument: doc.idDocument },
        data: { idCurrentVersion: version.idVersion },
        include: {
          owner: { select: { idUser: true, username: true } },
          currentVersion: true,
        },
      })
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS knowledge POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
