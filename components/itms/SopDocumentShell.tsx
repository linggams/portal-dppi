"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Download, FileText } from "lucide-react"
import { DocumentBody } from "@/components/itms/DocumentBody"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { extractDocumentToc } from "@/lib/itms/kb"
import { downloadSopPdf } from "@/lib/itms/sop-pdf"
import { formatTicketDate } from "@/lib/itms/format"
import { cn } from "@/lib/utils"

export type SopShellDoc = {
  number: string | null
  title: string
  tags: string
  statusLabel?: string
  effectiveDate: string | null
  nextReviewAt: string | null
  version: number | null
  body: string
  acknowledgedAt?: string | null
}

function MetaCell({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="min-w-0 border-r border-border/70 px-3 py-2 last:border-r-0">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm font-medium",
          mono && "font-mono text-xs"
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

export function SopDocumentShell({
  doc,
  backHref,
  backLabel = "Back to SOP register",
  actions,
  footer,
  className,
}: {
  doc: SopShellDoc
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  footer?: ReactNode
  className?: string
}) {
  const toc = extractDocumentToc(doc.body).filter((item) => item.level <= 2)
  const roleTag =
    doc.tags
      .split(",")
      .map((t) => t.trim())
      .find((t) =>
        [
          "it-manager",
          "network-engineer",
          "system-administrator",
          "it-support",
          "software-developer",
          "governance",
        ].includes(t)
      ) ?? null

  const roleLabel = roleTag
    ? roleTag
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null

  const [downloading, setDownloading] = useState(false)

  const onDownload = () => {
    setDownloading(true)
    try {
      downloadSopPdf({
        number: doc.number,
        title: doc.title,
        tags: doc.tags,
        statusLabel: doc.statusLabel,
        effectiveDate: doc.effectiveDate,
        nextReviewAt: doc.nextReviewAt,
        version: doc.version,
        body: doc.body,
      })
    } finally {
      // pdfmake download is sync kickoff; keep brief UI feedback
      window.setTimeout(() => setDownloading(false), 600)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {backHref ? (
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={downloading || !doc.body.trim()}
            onClick={onDownload}
          >
            <Download className="size-4" />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
          {actions}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-[linear-gradient(180deg,oklch(0.97_0.005_250)_0%,oklch(1_0_0)_100%)] px-5 py-5 dark:bg-none dark:bg-muted/20 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <FileText className="size-3.5" />
                  Controlled Document
                </span>
                {doc.statusLabel ? (
                  <Badge variant="secondary">{doc.statusLabel}</Badge>
                ) : null}
                {roleLabel ? <Badge variant="outline">{roleLabel}</Badge> : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
                {doc.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Standard Operating Procedure · Information Technology · PT Dasan
                Pan Pacific Indonesia
              </p>
            </div>
            <div className="rounded-lg border bg-background/80 px-4 py-3 text-right shadow-sm">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Document No.
              </p>
              <p className="mt-1 font-mono text-sm font-semibold">
                {doc.number ?? "DRAFT"}
              </p>
              <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Revision
              </p>
              <p className="mt-1 font-mono text-sm">
                {doc.version != null ? `Rev. ${doc.version}` : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b sm:grid-cols-4">
          <MetaCell
            label="Effective"
            value={
              doc.effectiveDate ? formatTicketDate(doc.effectiveDate) : "—"
            }
          />
          <MetaCell
            label="Next review"
            value={doc.nextReviewAt ? formatTicketDate(doc.nextReviewAt) : "—"}
          />
          <MetaCell
            label="Classification"
            value="Internal"
          />
          <MetaCell
            label="Doc. type"
            value="SOP"
            mono
          />
        </div>

        <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden border-r bg-muted/20 lg:block">
            <div className="sticky top-0 max-h-[calc(100svh-5.5rem)] overflow-y-auto p-4 [scrollbar-gutter:stable]">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Contents
              </p>
              {toc.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sections</p>
              ) : (
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-xs leading-snug text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
                        item.level === 1 && "font-medium text-foreground/80",
                        item.level === 2 && "pl-3"
                      )}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              )}
              {doc.acknowledgedAt ? (
                <div className="mt-6 flex items-start gap-2 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                  <span>
                    Acknowledged {formatTicketDate(doc.acknowledgedAt)}
                  </span>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <DocumentBody body={doc.body} variant="formal" />
          </div>
        </div>

        {footer ? (
          <footer className="flex flex-wrap items-center gap-3 border-t bg-muted/15 px-5 py-4 sm:px-7">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
