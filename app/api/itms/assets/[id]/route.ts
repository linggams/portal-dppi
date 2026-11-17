import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { Prisma } from "@prisma/client"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessItms,
  canAccessItmsStaff,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    type: z.string().min(1).max(50).optional(),
    serialNumber: z.string().max(100).nullable().optional(),
    brand: z.string().max(80).optional(),
    model: z.string().max(80).optional(),
    specs: z.string().optional(),
    purchaseDate: z.string().nullable().optional(),
    purchasePrice: z.number().nonnegative().nullable().optional(),
    vendor: z.string().max(100).optional(),
    warrantyUntil: z.string().nullable().optional(),
    location: z.string().max(100).optional(),
    notes: z.string().optional(),
    status: z
      .enum([
        "in_stock",
        "assigned",
        "in_repair",
        "retired",
        "disposed",
        "lost",
      ])
      .optional(),
  }),
  z.object({
    action: z.literal("assign"),
    idUser: z.number().int().positive(),
    conditionNote: z.string().max(255).optional(),
  }),
  z.object({
    action: z.literal("return"),
    conditionNote: z.string().max(255).optional(),
  }),
])

async function loadAsset(id: number) {
  return prisma.itmsAsset.findUnique({
    where: { idAsset: id },
    include: {
      holder: { select: { idUser: true, username: true, jabatan: true } },
      assignments: {
        orderBy: { assignedAt: "desc" },
        include: {
          user: { select: { idUser: true, username: true } },
        },
      },
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItms(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const asset = await loadAsset(id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const isStaff = canAccessItmsStaff(session.user)
    const userId = Number(session.user.id)
    if (!isStaff && asset.idHolder !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("ITMS asset GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItmsStaff(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = parseInt((await params).id, 10)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const existing = await prisma.itmsAsset.findUnique({
      where: { idAsset: id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const body = patchSchema.parse(await request.json())

    if (body.action === "update") {
      const data: Prisma.ItmsAssetUpdateInput = {}
      if (body.type !== undefined) data.type = body.type
      if (body.serialNumber !== undefined) data.serialNumber = body.serialNumber
      if (body.brand !== undefined) data.brand = body.brand
      if (body.model !== undefined) data.model = body.model
      if (body.specs !== undefined) data.specs = body.specs
      if (body.vendor !== undefined) data.vendor = body.vendor
      if (body.location !== undefined) data.location = body.location
      if (body.notes !== undefined) data.notes = body.notes
      if (body.status !== undefined) data.status = body.status
      if (body.purchaseDate !== undefined) {
        data.purchaseDate = body.purchaseDate
          ? new Date(body.purchaseDate)
          : null
      }
      if (body.warrantyUntil !== undefined) {
        data.warrantyUntil = body.warrantyUntil
          ? new Date(body.warrantyUntil)
          : null
      }
      if (body.purchasePrice !== undefined) {
        data.purchasePrice = body.purchasePrice
      }
      await prisma.itmsAsset.update({ where: { idAsset: id }, data })
    } else if (body.action === "assign") {
      const user = await prisma.user.findUnique({
        where: { idUser: body.idUser },
      })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 })
      }

      await prisma.$transaction(async (tx) => {
        if (existing.idHolder) {
          await tx.itmsAssetAssignment.updateMany({
            where: {
              idAsset: id,
              idUser: existing.idHolder,
              returnedAt: null,
            },
            data: {
              returnedAt: new Date(),
              conditionNote: "Reassigned",
            },
          })
        }
        await tx.itmsAssetAssignment.create({
          data: {
            idAsset: id,
            idUser: body.idUser,
            conditionNote: body.conditionNote ?? "",
          },
        })
        await tx.itmsAsset.update({
          where: { idAsset: id },
          data: {
            idHolder: body.idUser,
            status: "assigned",
          },
        })
      })
    } else if (body.action === "return") {
      if (!existing.idHolder) {
        return NextResponse.json(
          { error: "Asset is not assigned" },
          { status: 400 }
        )
      }
      await prisma.$transaction([
        prisma.itmsAssetAssignment.updateMany({
          where: {
            idAsset: id,
            idUser: existing.idHolder,
            returnedAt: null,
          },
          data: {
            returnedAt: new Date(),
            conditionNote: body.conditionNote ?? "",
          },
        }),
        prisma.itmsAsset.update({
          where: { idAsset: id },
          data: {
            idHolder: null,
            status: "in_stock",
          },
        }),
      ])
    }

    return NextResponse.json(await loadAsset(id))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS asset PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
