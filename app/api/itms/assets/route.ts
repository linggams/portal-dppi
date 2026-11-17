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
  tag: z.string().min(2).max(40),
  type: z.string().min(1).max(50),
  serialNumber: z.string().max(100).optional().nullable(),
  brand: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  specs: z.string().optional(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.number().nonnegative().optional().nullable(),
  vendor: z.string().max(100).optional(),
  warrantyUntil: z.string().optional().nullable(),
  location: z.string().max(100).optional(),
  notes: z.string().optional(),
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
    const userId = Number(session.user.id)
    const mine = params.get("mine") === "true" || !isStaff
    const status = params.get("status")
    const type = params.get("type")
    const q = params.get("q")?.trim()

    const where: Prisma.ItmsAssetWhereInput = {}
    if (mine) where.idHolder = userId
    if (status) {
      where.status = status as Prisma.EnumItmsAssetStatusFilter["equals"]
    }
    if (type) where.type = type
    if (q) {
      where.OR = [
        { tag: { contains: q, mode: "insensitive" } },
        { serialNumber: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
      ]
    }

    const [total, assets] = await Promise.all([
      prisma.itmsAsset.count({ where }),
      prisma.itmsAsset.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: {
          holder: { select: { idUser: true, username: true, jabatan: true } },
        },
      }),
    ])

    return NextResponse.json(toPaginatedResult(assets, total, page, pageSize))
  } catch (error) {
    console.error("ITMS assets GET:", error)
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
    const existing = await prisma.itmsAsset.findUnique({
      where: { tag: body.tag },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Asset tag already exists" },
        { status: 400 }
      )
    }

    const asset = await prisma.itmsAsset.create({
      data: {
        tag: body.tag,
        type: body.type,
        serialNumber: body.serialNumber || null,
        brand: body.brand ?? "",
        model: body.model ?? "",
        specs: body.specs ?? "",
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice:
          body.purchasePrice === undefined || body.purchasePrice === null
            ? null
            : body.purchasePrice,
        vendor: body.vendor ?? "",
        warrantyUntil: body.warrantyUntil
          ? new Date(body.warrantyUntil)
          : null,
        location: body.location ?? "",
        notes: body.notes ?? "",
        status: "in_stock",
      },
      include: {
        holder: { select: { idUser: true, username: true } },
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS assets POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
