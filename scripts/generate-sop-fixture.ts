/**
 * Extract IT SOPs from D:\dev\sop-it into prisma/data/sop-documents.json
 * (portable fixture for prisma seed — no dependency on sop-it at deploy time).
 *
 * Usage: pnpm exec tsx scripts/generate-sop-fixture.ts
 */
import fs from "node:fs"
import path from "node:path"

const SOP_ROOT = path.resolve("D:/dev/sop-it/app/information-technology")
const OUT_FILE = path.resolve("prisma/data/sop-documents.json")

type SopFixtureDoc = {
  number: string
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
  const re = new RegExp(
    openRe.source,
    openRe.flags.includes("g") ? openRe.flags : openRe.flags + "g"
  )
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

function extractDoc(filePath: string): Omit<SopFixtureDoc, "number"> | null {
  const source = fs.readFileSync(filePath, "utf8")
  const rel = path
    .relative(SOP_ROOT, filePath)
    .replace(/\\/g, "/")
    .replace(/\/page\.tsx$/, "")
  const slug = rel.split("/").pop() || rel
  const role = roleFromPath(rel)

  const h1 =
    stripJsx(extractBetween(source, /<h1[^>]*>/, "</h1>")[0] || "") || slug

  const description =
    stripJsx(
      extractBetween(
        source,
        /<p className="text-muted-foreground"[^>]*>/,
        "</p>"
      )[0] || ""
    ) || ""

  const badges = extractBetween(source, /<Badge[^>]*>/, "</Badge>")
    .map(stripJsx)
    .filter(Boolean)

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

function main() {
  if (!fs.existsSync(SOP_ROOT)) {
    throw new Error(`SOP source not found: ${SOP_ROOT}`)
  }

  const year = new Date().getFullYear()
  const files = collectPages(SOP_ROOT).sort()
  const docs: SopFixtureDoc[] = []
  let index = 0

  for (const file of files) {
    const doc = extractDoc(file)
    if (!doc) {
      console.log(`Skipped: ${path.relative(SOP_ROOT, file)}`)
      continue
    }
    index += 1
    docs.push({
      number: `SOP-IT-${year}-${String(index).padStart(3, "0")}`,
      ...doc,
    })
    console.log(`+ ${docs[docs.length - 1].number}: ${doc.title}`)
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(docs, null, 2)}\n`, "utf8")
  console.log(`Wrote ${docs.length} SOPs → ${OUT_FILE}`)
}

main()
