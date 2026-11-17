import fs from "node:fs"
import path from "node:path"
import type { PrismaClient } from "@prisma/client"

export type SopFixtureDoc = {
  number: string
  slug: string
  role: string
  title: string
  description: string
  tags: string
  body: string
}

const FIXTURE_PATH = path.join(__dirname, "data", "sop-documents.json")

export function loadSopFixture(): SopFixtureDoc[] {
  if (!fs.existsSync(FIXTURE_PATH)) {
    throw new Error(`SOP fixture not found: ${FIXTURE_PATH}`)
  }
  const raw = fs.readFileSync(FIXTURE_PATH, "utf8")
  const docs = JSON.parse(raw) as SopFixtureDoc[]
  if (!Array.isArray(docs) || docs.length === 0) {
    throw new Error(`SOP fixture is empty: ${FIXTURE_PATH}`)
  }
  return docs
}

async function upsertSopDocument(
  prisma: PrismaClient,
  ownerId: number,
  doc: SopFixtureDoc
) {
  const existing = await prisma.itmsKbDocument.findFirst({
    where: {
      OR: [{ number: doc.number }, { title: doc.title }],
    },
    include: { currentVersion: true },
  })

  const now = new Date()
  const nextReview = new Date(now)
  nextReview.setFullYear(nextReview.getFullYear() + 1)

  if (existing) {
    if (existing.currentVersion) {
      await prisma.itmsKbVersion.update({
        where: { idVersion: existing.currentVersion.idVersion },
        data: {
          body: doc.body,
          changeNote: "Synced from SOP seed fixture",
          idApprovedBy: ownerId,
          approvedAt: now,
        },
      })
    } else {
      const version = await prisma.itmsKbVersion.create({
        data: {
          idDocument: existing.idDocument,
          version: 1,
          body: doc.body,
          changeNote: "Synced from SOP seed fixture",
          idAuthor: ownerId,
          idApprovedBy: ownerId,
          approvedAt: now,
        },
      })
      await prisma.itmsKbDocument.update({
        where: { idDocument: existing.idDocument },
        data: { idCurrentVersion: version.idVersion },
      })
    }
    await prisma.itmsKbDocument.update({
      where: { idDocument: existing.idDocument },
      data: {
        kind: "sop",
        number: existing.number ?? doc.number,
        title: doc.title,
        status: "published",
        visibility: "internal_all",
        tags: doc.tags,
        effectiveDate: existing.effectiveDate ?? now,
        nextReviewAt: existing.nextReviewAt ?? nextReview,
      },
    })
    return { id: existing.idDocument, number: existing.number ?? doc.number, updated: true }
  }

  const created = await prisma.$transaction(async (tx) => {
    const document = await tx.itmsKbDocument.create({
      data: {
        kind: "sop",
        number: doc.number,
        title: doc.title,
        idOwner: ownerId,
        status: "published",
        visibility: "internal_all",
        tags: doc.tags,
        effectiveDate: now,
        nextReviewAt: nextReview,
      },
    })
    const version = await tx.itmsKbVersion.create({
      data: {
        idDocument: document.idDocument,
        version: 1,
        body: doc.body,
        changeNote: "Initial seed from SOP fixture",
        idAuthor: ownerId,
        idApprovedBy: ownerId,
        approvedAt: now,
      },
    })
    await tx.itmsKbDocument.update({
      where: { idDocument: document.idDocument },
      data: { idCurrentVersion: version.idVersion },
    })
    return document
  })

  return { id: created.idDocument, number: doc.number, updated: false }
}

/** Idempotent upsert of published SOP documents from prisma/data/sop-documents.json */
export async function seedSopDocuments(prisma: PrismaClient): Promise<void> {
  const docs = loadSopFixture()

  const owner =
    (await prisma.user.findFirst({
      where: { OR: [{ username: "admin" }, { manageItms: true }] },
      orderBy: { idUser: "asc" },
    })) ?? null
  if (!owner) {
    throw new Error("No ITMS owner user found (need admin / manageItms)")
  }

  console.log(`📄 Seeding ${docs.length} SOP documents (owner: ${owner.username})...`)

  for (const doc of docs) {
    const result = await upsertSopDocument(prisma, owner.idUser, doc)
    console.log(
      `  ${result.updated ? "Updated" : "Created"} ${result.number}: ${doc.title}`
    )
  }
}
