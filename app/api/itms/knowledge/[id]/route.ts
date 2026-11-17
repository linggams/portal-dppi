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
    action: z.literal("update_meta"),
    title: z.string().min(3).max(200).optional(),
    tags: z.string().max(255).optional(),
    visibility: z.enum(["internal_all", "it_only"]).optional(),
    effectiveDate: z.string().nullable().optional(),
    nextReviewAt: z.string().nullable().optional(),
  }),
  z.object({
    action: z.literal("new_version"),
    body: z.string().min(1),
    changeNote: z.string().max(255).optional(),
  }),
  z.object({ action: z.literal("submit_review") }),
  z.object({ action: z.literal("publish") }),
  z.object({ action: z.literal("acknowledge") }),
])

async function loadDocument(id: number) {
  return prisma.itmsKbDocument.findUnique({
    where: { idDocument: id },
    include: {
      owner: { select: { idUser: true, username: true } },
      currentVersion: {
        include: {
          author: { select: { idUser: true, username: true } },
          approvedBy: { select: { idUser: true, username: true } },
        },
      },
      versions: {
        orderBy: { version: "desc" },
        include: {
          author: { select: { idUser: true, username: true } },
        },
      },
      acknowledgments: {
        orderBy: { acknowledgedAt: "desc" },
        take: 50,
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

    const doc = await loadDocument(id)
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const isStaff = canAccessItmsStaff(session.user)
    if (!isStaff) {
      if (doc.status !== "published" || doc.visibility === "it_only") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const userId = Number(session.user.id)
    const acknowledged = doc.currentVersion
      ? await prisma.itmsKbAcknowledgment.findUnique({
          where: {
            idVersion_idUser: {
              idVersion: doc.currentVersion.idVersion,
              idUser: userId,
            },
          },
        })
      : null

    return NextResponse.json({
      ...doc,
      acknowledgedAt: acknowledged?.acknowledgedAt ?? null,
    })
  } catch (error) {
    console.error("ITMS knowledge detail GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
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

    const existing = await prisma.itmsKbDocument.findUnique({
      where: { idDocument: id },
      include: { currentVersion: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const userId = Number(session.user.id)
    const isStaff = canAccessItmsStaff(session.user)
    const body = patchSchema.parse(await request.json())

    if (body.action === "acknowledge") {
      if (
        existing.status !== "published" ||
        !existing.currentVersion ||
        (!isStaff && existing.visibility === "it_only")
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      const acknowledgedAt = new Date()
      await prisma.itmsKbAcknowledgment.upsert({
        where: {
          idVersion_idUser: {
            idVersion: existing.currentVersion.idVersion,
            idUser: userId,
          },
        },
        update: { acknowledgedAt },
        create: {
          idVersion: existing.currentVersion.idVersion,
          idDocument: id,
          idUser: userId,
        },
      })
      return NextResponse.json({
        ...(await loadDocument(id)),
        acknowledgedAt,
      })
    }

    if (!isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (body.action === "update_meta") {
      const data: Prisma.ItmsKbDocumentUpdateInput = {}
      if (body.title !== undefined) data.title = body.title
      if (body.tags !== undefined) data.tags = body.tags
      if (body.visibility !== undefined) data.visibility = body.visibility
      if (body.effectiveDate !== undefined) {
        data.effectiveDate = body.effectiveDate
          ? new Date(body.effectiveDate)
          : null
      }
      if (body.nextReviewAt !== undefined) {
        data.nextReviewAt = body.nextReviewAt
          ? new Date(body.nextReviewAt)
          : null
      }
      await prisma.itmsKbDocument.update({
        where: { idDocument: id },
        data,
      })
    } else if (body.action === "new_version") {
      const last = await prisma.itmsKbVersion.findFirst({
        where: { idDocument: id },
        orderBy: { version: "desc" },
      })
      const nextVersion = (last?.version ?? 0) + 1
      const version = await prisma.itmsKbVersion.create({
        data: {
          idDocument: id,
          version: nextVersion,
          body: body.body,
          changeNote: body.changeNote ?? `Version ${nextVersion}`,
          idAuthor: userId,
        },
      })
      await prisma.itmsKbDocument.update({
        where: { idDocument: id },
        data: {
          idCurrentVersion: version.idVersion,
          status: "draft",
        },
      })
    } else if (body.action === "submit_review") {
      if (existing.status !== "draft") {
        return NextResponse.json(
          { error: "Only draft documents can be submitted" },
          { status: 400 }
        )
      }
      await prisma.itmsKbDocument.update({
        where: { idDocument: id },
        data: { status: "in_review" },
      })
    } else if (body.action === "publish") {
      if (!existing.currentVersion) {
        return NextResponse.json(
          { error: "Document has no version to publish" },
          { status: 400 }
        )
      }
      await prisma.$transaction([
        prisma.itmsKbVersion.update({
          where: { idVersion: existing.currentVersion.idVersion },
          data: {
            idApprovedBy: userId,
            approvedAt: new Date(),
          },
        }),
        prisma.itmsKbDocument.update({
          where: { idDocument: id },
          data: {
            status: "published",
            effectiveDate: existing.effectiveDate ?? new Date(),
          },
        }),
      ])
    }

    return NextResponse.json(await loadDocument(id))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("ITMS knowledge PATCH:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
