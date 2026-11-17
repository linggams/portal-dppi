import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import {
  COMPANY_LEGAL_NAME,
  companyPdfHeader,
} from "@/lib/shared/app-branding"
import { parseDocumentBlocks } from "@/lib/itms/kb"
import { formatTicketDate } from "@/lib/itms/format"

export type SopPdfInput = {
  number: string | null
  title: string
  tags?: string
  statusLabel?: string
  effectiveDate: string | null
  nextReviewAt: string | null
  version: number | null
  body: string
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return "—"
  try {
    return formatTicketDate(value).split(",")[0] ?? formatTicketDate(value)
  } catch {
    return value
  }
}

function roleFromTags(tags: string | undefined): string {
  if (!tags) return "Information Technology"
  const known: Record<string, string> = {
    "it-manager": "IT Manager",
    "network-engineer": "Network Engineer",
    "system-administrator": "System Administrator",
    "it-support": "IT Support",
    "software-developer": "Software Developer",
    governance: "Governance",
  }
  for (const part of tags.split(",").map((t) => t.trim())) {
    if (known[part]) return known[part]
  }
  return "Information Technology"
}

function metaCell(label: string, value: string) {
  return {
    stack: [
      {
        text: label.toUpperCase(),
        fontSize: 7,
        bold: true,
        color: "#64748b",
        characterSpacing: 0.6,
        margin: [0, 0, 0, 2] as [number, number, number, number],
      },
      {
        text: value,
        fontSize: 9,
        bold: true,
        color: "#0f172a",
      },
    ],
    margin: [4, 4, 4, 4] as [number, number, number, number],
  }
}

function bodyContent(body: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content: any[] = []
  const blocks = parseDocumentBlocks(body || "")
  let olIndex = 0

  for (const block of blocks) {
    if (block.type === "h1") {
      olIndex = 0
      content.push({
        text: block.text,
        style: "h1",
        margin: [0, 14, 0, 6],
      })
      content.push({
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.7,
            lineColor: "#cbd5e1",
          },
        ],
        margin: [0, 0, 0, 8],
      })
      continue
    }
    if (block.type === "h2") {
      olIndex = 0
      content.push({
        text: block.text,
        style: "h2",
        margin: [0, 12, 0, 4],
      })
      continue
    }
    if (block.type === "h3") {
      olIndex = 0
      content.push({
        text: block.text,
        style: "h3",
        margin: [0, 8, 0, 3],
      })
      continue
    }
    if (block.type === "li") {
      content.push({
        columns: [
          { width: 14, text: "•", color: "#334155", fontSize: 10 },
          {
            width: "*",
            text: block.text,
            style: "body",
            alignment: "justify",
          },
        ],
        columnGap: 4,
        margin: [4, 1, 0, 1],
      })
      continue
    }
    if (block.type === "ol") {
      olIndex += 1
      content.push({
        columns: [
          {
            width: 18,
            text: `${olIndex}.`,
            fontSize: 9,
            color: "#64748b",
            alignment: "right",
          },
          {
            width: "*",
            text: block.text,
            style: "body",
            alignment: "justify",
          },
        ],
        columnGap: 6,
        margin: [4, 1, 0, 1],
      })
      continue
    }
    content.push({
      text: block.text,
      style: "body",
      alignment: "justify",
      margin: [0, 2, 0, 4],
    })
  }

  if (content.length === 0) {
    content.push({
      text: "No content available.",
      italics: true,
      color: "#64748b",
      fontSize: 10,
    })
  }

  return content
}

export function downloadSopPdf(doc: SopPdfInput) {
  try {
    const docNo = doc.number ?? "DRAFT"
    const revision =
      doc.version != null ? `Rev. ${doc.version}` : "Unversioned"
    const functionName = roleFromTags(doc.tags)
    const safeName = docNo.replace(/[^\w.-]+/g, "_")
    const filename = `${safeName}_${doc.title.replace(/[^\w.-]+/g, "_").slice(0, 40)}.pdf`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [40, 72, 40, 56],
      info: {
        title: `${docNo} — ${doc.title}`,
        author: COMPANY_LEGAL_NAME,
        subject: "Standard Operating Procedure",
        keywords: "SOP, IT, controlled document",
      },
      header: (currentPage: number) => {
        if (currentPage === 1) return null
        return {
          margin: [40, 24, 40, 0],
          columns: [
            {
              text: "CONTROLLED DOCUMENT — SOP",
              fontSize: 8,
              color: "#64748b",
              bold: true,
              characterSpacing: 0.8,
            },
            {
              text: docNo,
              alignment: "right",
              fontSize: 8,
              color: "#0f172a",
              bold: true,
            },
          ],
        }
      },
      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 0, 40, 24],
        stack: [
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 0.6,
                lineColor: "#cbd5e1",
              },
            ],
            margin: [0, 0, 0, 6],
          },
          {
            columns: [
              {
                text: "INTERNAL — Information Technology",
                fontSize: 7,
                color: "#64748b",
              },
              {
                text: `${docNo} · ${revision}`,
                alignment: "center",
                fontSize: 7,
                color: "#64748b",
              },
              {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: "right",
                fontSize: 7,
                color: "#64748b",
              },
            ],
          },
        ],
      }),
      content: [
        ...companyPdfHeader({ lineWidth: 515, afterLine: 12 }),
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: "STANDARD OPERATING PROCEDURE",
                  fontSize: 8,
                  bold: true,
                  color: "#64748b",
                  characterSpacing: 1.2,
                  margin: [0, 0, 0, 6],
                },
                {
                  text: doc.title,
                  fontSize: 16,
                  bold: true,
                  color: "#0f172a",
                  margin: [0, 0, 0, 4],
                },
                {
                  text: `Information Technology · ${functionName}`,
                  fontSize: 9,
                  color: "#475569",
                },
              ],
            },
            {
              width: 150,
              table: {
                widths: ["*"],
                body: [
                  [
                    {
                      stack: [
                        {
                          text: "DOCUMENT NO.",
                          fontSize: 7,
                          bold: true,
                          color: "#64748b",
                          characterSpacing: 0.6,
                        },
                        {
                          text: docNo,
                          fontSize: 10,
                          bold: true,
                          margin: [0, 2, 0, 8],
                        },
                        {
                          text: "REVISION",
                          fontSize: 7,
                          bold: true,
                          color: "#64748b",
                          characterSpacing: 0.6,
                        },
                        {
                          text: revision,
                          fontSize: 10,
                          bold: true,
                          margin: [0, 2, 0, 0],
                        },
                      ],
                      fillColor: "#f8fafc",
                      border: [true, true, true, true],
                      borderColor: ["#cbd5e1", "#cbd5e1", "#cbd5e1", "#cbd5e1"],
                      margin: [8, 8, 8, 8],
                    },
                  ],
                ],
              },
              layout: {
                defaultBorder: false,
              },
            },
          ],
          columnGap: 16,
          margin: [0, 0, 0, 12],
        },
        {
          table: {
            widths: ["*", "*", "*"],
            body: [
              [
                metaCell("Effective", formatDateOnly(doc.effectiveDate)),
                metaCell("Next review", formatDateOnly(doc.nextReviewAt)),
                metaCell(
                  "Status",
                  doc.statusLabel || "Published"
                ),
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            hLineColor: () => "#cbd5e1",
            vLineColor: () => "#cbd5e1",
          },
          margin: [0, 0, 0, 16],
        },
        {
          text: "DOCUMENT BODY",
          fontSize: 8,
          bold: true,
          color: "#64748b",
          characterSpacing: 1,
          margin: [0, 0, 0, 8],
        },
        ...bodyContent(doc.body),
        {
          margin: [0, 24, 0, 0],
          table: {
            widths: ["*", "*", "*"],
            body: [
              [
                {
                  stack: [
                    {
                      text: "PREPARED BY",
                      fontSize: 7,
                      bold: true,
                      color: "#64748b",
                      characterSpacing: 0.6,
                    },
                    {
                      text: "\n\n",
                      fontSize: 9,
                    },
                    {
                      text: "________________",
                      fontSize: 9,
                    },
                    {
                      text: "Document Owner",
                      fontSize: 8,
                      color: "#64748b",
                    },
                  ],
                  margin: [6, 8, 6, 8],
                },
                {
                  stack: [
                    {
                      text: "REVIEWED BY",
                      fontSize: 7,
                      bold: true,
                      color: "#64748b",
                      characterSpacing: 0.6,
                    },
                    {
                      text: "\n\n",
                      fontSize: 9,
                    },
                    {
                      text: "________________",
                      fontSize: 9,
                    },
                    {
                      text: "IT Manager",
                      fontSize: 8,
                      color: "#64748b",
                    },
                  ],
                  margin: [6, 8, 6, 8],
                },
                {
                  stack: [
                    {
                      text: "APPROVED BY",
                      fontSize: 7,
                      bold: true,
                      color: "#64748b",
                      characterSpacing: 0.6,
                    },
                    {
                      text: "\n\n",
                      fontSize: 9,
                    },
                    {
                      text: "________________",
                      fontSize: 9,
                    },
                    {
                      text: "Authorized Approver",
                      fontSize: 8,
                      color: "#64748b",
                    },
                  ],
                  margin: [6, 8, 6, 8],
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.6,
            vLineWidth: () => 0.6,
            hLineColor: () => "#cbd5e1",
            vLineColor: () => "#cbd5e1",
          },
        },
        {
          text: "This controlled document is property of PT Dasan Pan Pacific Indonesia. Uncontrolled when printed unless stamped.",
          fontSize: 7,
          italics: true,
          color: "#94a3b8",
          margin: [0, 14, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 12, bold: true },
        subheader: { fontSize: 8, color: "#475569" },
        h1: { fontSize: 13, bold: true, color: "#0f172a" },
        h2: { fontSize: 11, bold: true, color: "#0f172a" },
        h3: { fontSize: 10, bold: true, color: "#1e293b" },
        body: { fontSize: 9.5, color: "#1e293b", lineHeight: 1.35 },
      },
      defaultStyle: {
        font: "Roboto",
        fontSize: 9.5,
        color: "#1e293b",
      },
    }

    downloadPdf(docDefinition, filename)
    toast.success("SOP PDF downloaded")
  } catch (error) {
    console.error("SOP PDF error:", error)
    toast.error("Failed to generate SOP PDF")
  }
}
