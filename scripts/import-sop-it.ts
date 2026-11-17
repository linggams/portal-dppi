/**
 * Import IT SOPs from D:\dev\sop-it page.tsx files into ITMS documents.
 *
 * Usage: pnpm exec tsx scripts/import-sop-it.ts
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:mokmok@localhost:5432/atk?schema=public"
}

import fs from "node:fs"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const SOP_ROOT = path.resolve("D:/dev/sop-it/app/information-technology")

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

type ExtractedDoc = {
  slug: string
  role: string
  title: string
  description: string
  tags: string
  body: string
}

function stripJsx(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\{`([^`]*)`\}/g, "$1")
    .replace(/\{\s*["']([^"']*)["']\s*\}/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function extractBetween(
  source: string,
  openRe: RegExp,
  closeTag: string
): string[] {
  const results: string[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(openRe.source, openRe.flags.includes("g") ? openRe.flags : openRe.flags + "g")
  while ((match = re.exec(source)) !== null) {
    const start = match.index + match[0].length
    const end = source.indexOf(closeTag, start)
    if (end === -1) continue
    results.push(source.slice(start, end))
  }
  return results
}

function roleFromPath(rel: string): string {
  if (rel.startsWith("it-manager")) return "IT Manager"
  if (rel.startsWith("network-engineer")) return "Network Engineer"
  if (rel.startsWith("system-administrator")) return "System Administrator"
  if (rel.startsWith("support")) return "IT Support"
  if (rel.startsWith("software-developer")) return "Software Developer"
  return "IT"
}

function extractDoc(filePath: string): ExtractedDoc | null {
  const source = fs.readFileSync(filePath, "utf8")
  const rel = path
    .relative(SOP_ROOT, filePath)
    .replace(/\\/g, "/")
    .replace(/\/page\.tsx$/, "")
  const slug = rel.split("/").pop() || rel
  const role = roleFromPath(rel)

  const h1 =
    stripJsx(
      extractBetween(source, /<h1[^>]*>/, "</h1>")[0] || ""
    ) || slug

  const description =
    stripJsx(
      extractBetween(
        source,
        /<p className="text-muted-foreground"[^>]*>/,
        "</p>"
      )[0] || ""
    ) || ""

  const badges = extractBetween(
    source,
    /<Badge[^>]*>/,
    "</Badge>"
  ).map(stripJsx).filter(Boolean)

  // NIST mapping has a dedicated page under /itms/*/nist — skip as SOP doc.
  if (slug === "mapping-offerings-to-nist-cybersecurity") {
    return null
  }

  const lines: string[] = []
  if (description) {
    lines.push(description, "")
  }

  const tokenRe =
    /<(CardTitle|h4|p|li|th|td)(\s[^>]*)?>([\s\S]*?)<\/\1>/g
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(source)) !== null) {
    const tag = m[1]
    const text = stripJsx(m[3])
    if (!text) continue
    if (tag === "CardTitle") {
      lines.push("", `## ${text}`, "")
    } else if (tag === "h4") {
      lines.push("", `### ${text}`, "")
    } else if (tag === "li") {
      lines.push(`- ${text}`)
    } else if (tag === "th" || tag === "td") {
      lines.push(`- ${text}`)
    } else if (tag === "p") {
      if (m[2]?.includes("text-muted-foreground")) continue
      lines.push(text, "")
    }
  }

  const cleaned: string[] = []
  for (const line of lines) {
    if (line === "" && cleaned[cleaned.length - 1] === "") continue
    if (line !== "" && line === cleaned[cleaned.length - 1]) continue
    cleaned.push(line)
  }
  const body = cleaned.join("\n").trim()

  const tagParts = [
    "sop",
    "it",
    role.toLowerCase().replace(/\s+/g, "-"),
    ...badges
      .map((b) =>
        b
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
      .filter((b) => b && b !== "information-technology-standard"),
  ]
  const tags = [...new Set(tagParts)].join(", ")

  return {
    slug,
    role,
    title: h1.slice(0, 200),
    description,
    tags,
    body: body || description || h1,
  }
}

function collectPages(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectPages(full))
    else if (entry.name === "page.tsx") out.push(full)
  }
  return out
}

async function upsertDocument(
  ownerId: number,
  doc: ExtractedDoc,
  index: number
) {
  const year = new Date().getFullYear()
  const number = `SOP-IT-${year}-${String(index).padStart(3, "0")}`

  const existing = await prisma.itmsKbDocument.findFirst({
    where: {
      OR: [{ number }, { title: doc.title }],
    },
    include: { currentVersion: true },
  })

  const now = new Date()
  const nextReview = new Date(now)
  nextReview.setFullYear(nextReview.getFullYear() + 1)

  if (existing) {
    // Update current revision in place — do not stack "old + new" versions.
    if (existing.currentVersion) {
      await prisma.itmsKbVersion.update({
        where: { idVersion: existing.currentVersion.idVersion },
        data: {
          body: doc.body,
          changeNote: "Synced from sop-it source",
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
          changeNote: "Synced from sop-it source",
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
        number: existing.number ?? number,
        title: doc.title,
        status: "published",
        visibility: "internal_all",
        tags: doc.tags,
        effectiveDate: existing.effectiveDate ?? now,
        nextReviewAt: existing.nextReviewAt ?? nextReview,
      },
    })
    return { id: existing.idDocument, number: existing.number ?? number, updated: true }
  }

  const created = await prisma.$transaction(async (tx) => {
    const document = await tx.itmsKbDocument.create({
      data: {
        kind: "sop",
        number,
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
        changeNote: "Initial import from sop-it",
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

  return { id: created.idDocument, number, updated: false }
}

async function main() {
  if (!fs.existsSync(SOP_ROOT)) {
    throw new Error(`SOP source not found: ${SOP_ROOT}`)
  }

  const owner =
    (await prisma.user.findFirst({
      where: { OR: [{ username: "admin" }, { manageItms: true }] },
      orderBy: { idUser: "asc" },
    })) ?? null
  if (!owner) {
    throw new Error("No ITMS owner user found (need admin / manageItms)")
  }

  const files = collectPages(SOP_ROOT).sort()
  console.log(`Found ${files.length} SOP pages under ${SOP_ROOT}`)
  console.log(`Owner: ${owner.username} (#${owner.idUser})`)

  let sopIndex = 0
  for (const file of files) {
    const doc = extractDoc(file)
    if (!doc) {
      console.log(`Skipped (dedicated page): ${path.relative(SOP_ROOT, file)}`)
      continue
    }
    sopIndex += 1
    const result = await upsertDocument(owner.idUser, doc, sopIndex)
    console.log(
      `${result.updated ? "Updated" : "Created"} SOP ${result.number}: ${doc.title} (${doc.body.length} chars)`
    )
  }

  const counts = await prisma.itmsKbDocument.groupBy({
    by: ["kind", "status"],
    _count: true,
  })
  console.log("Done. Document counts:", counts)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
