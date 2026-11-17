import type { ItmsKbStatus } from "@prisma/client"

export const KB_STATUS_LABEL: Record<ItmsKbStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  published: "Published",
  archived: "Archived",
}

type DocumentBlock = {
  type: "h1" | "h2" | "h3" | "p" | "li" | "ol"
  text: string
  id?: string
}

function headingSlug(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48)
  return base ? `sec-${base}` : `sec-${index + 1}`
}

/** Lightweight structured rendering for plain-text documents. */
export function parseDocumentBlocks(body: string): DocumentBlock[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n")
  const blocks: DocumentBlock[] = []
  let paragraph: string[] = []
  let headingCount = 0

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim()
    if (text) blocks.push({ type: "p", text })
    paragraph = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    const trimmed = line.trim()
    if (!trimmed) {
      flushParagraph()
      continue
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph()
      const text = trimmed.slice(4).trim()
      blocks.push({
        type: "h3",
        text,
        id: headingSlug(text, headingCount++),
      })
      continue
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph()
      const text = trimmed.slice(3).trim()
      blocks.push({
        type: "h2",
        text,
        id: headingSlug(text, headingCount++),
      })
      continue
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph()
      const text = trimmed.slice(2).trim()
      blocks.push({
        type: "h1",
        text,
        id: headingSlug(text, headingCount++),
      })
      continue
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph()
      blocks.push({ type: "ol", text: trimmed.replace(/^\d+\.\s+/, "") })
      continue
    }
    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph()
      blocks.push({ type: "li", text: trimmed.replace(/^[-*]\s+/, "") })
      continue
    }
    paragraph.push(trimmed)
  }
  flushParagraph()
  return blocks
}

export function extractDocumentToc(
  body: string
): Array<{ id: string; text: string; level: 1 | 2 | 3 }> {
  return parseDocumentBlocks(body)
    .filter(
      (b): b is DocumentBlock & { id: string } =>
        (b.type === "h1" || b.type === "h2" || b.type === "h3") && Boolean(b.id)
    )
    .map((b) => ({
      id: b.id,
      text: b.text,
      level: b.type === "h1" ? 1 : b.type === "h2" ? 2 : 3,
    }))
}
