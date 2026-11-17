"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, FileText, Plus, Search } from "lucide-react"
import { DashboardLayout, ContentEmpty, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TablePagination } from "@/components/ui/table-pagination"
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import { KB_STATUS_LABEL } from "@/lib/itms/kb"
import { formatTicketDate } from "@/lib/itms/format"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { ItmsKbStatus } from "@prisma/client"

type DocRow = {
  idDocument: number
  number: string | null
  title: string
  status: ItmsKbStatus
  tags: string
  currentVersion: { version: number } | null
  updatedAt: string
  effectiveDate?: string | null
  nextReviewAt?: string | null
}

function roleFromTags(tags: string): string | null {
  const known = [
    "it-manager",
    "network-engineer",
    "system-administrator",
    "it-support",
    "software-developer",
    "governance",
  ]
  const hit = tags
    .split(",")
    .map((t) => t.trim())
    .find((t) => known.includes(t))
  if (!hit) return null
  return hit
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function ItmsDocumentListPage({
  area,
  publishedOnly = false,
}: {
  area: "console" | "portal"
  publishedOnly?: boolean
}) {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="SOP Register">
          <Skeleton className="h-64 w-full" />
        </DashboardLayout>
      }
    >
      <ItmsDocumentListPageInner
        area={area}
        publishedOnly={publishedOnly}
      />
    </Suspense>
  )
}

function ItmsDocumentListPageInner({
  area,
  publishedOnly = false,
}: {
  area: "console" | "portal"
  publishedOnly?: boolean
}) {
  const base = `/itms/${area}/sop`
  const searchParams = useSearchParams()
  const initialQ = searchParams.get("q")?.trim() ?? ""
  const [rows, setRows] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [q, setQ] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)

  useEffect(() => {
    const next = searchParams.get("q")?.trim() ?? ""
    setQ(next)
    setQuery(next)
    setPage(1)
  }, [searchParams])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        kind: "sop",
      })
      if (publishedOnly) params.set("published", "true")
      if (query) params.set("q", query)
      const res = await fetch(`/api/itms/knowledge?${params}`)
      if (!res.ok) throw new Error("Failed")
      const data = readPaginatedJson<DocRow>(await res.json())
      setRows(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPageSize(data.pageSize)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, publishedOnly, query])

  useEffect(() => {
    load()
  }, [load])

  return (
    <DashboardLayout title="SOP Register">
      <PageActions>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setQuery(q.trim())
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search document no. or title…"
              className="w-64 pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
        {area === "console" ? (
          <Button asChild>
            <Link href={`${base}/new`}>
              <Plus className="size-4" />
              New SOP
            </Link>
          </Button>
        ) : null}
      </PageActions>

      <div className="mb-5 overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/25 px-5 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <FileText className="size-3.5" />
              Document Control
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              IT Standard Operating Procedures
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Controlled procedures for Information Technology at PT Dasan Pan
              Pacific Indonesia. Each document carries a number, revision, and
              review cycle.
            </p>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3 text-right">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Active documents
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
              {loading ? "—" : total}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <ContentEmpty
          title="No SOPs found"
          description={
            area === "console"
              ? "Create the first SOP to get started."
              : "Try another search, or check back later."
          }
        />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Function</TableHead>
                  {area === "console" ? <TableHead>Status</TableHead> : null}
                  <TableHead>Rev.</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead>Next review</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.idDocument} className="group">
                    <TableCell className="font-mono text-xs font-medium">
                      {row.number ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`${base}/${row.idDocument}`}
                        className="font-medium group-hover:underline"
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {roleFromTags(row.tags) ?? "—"}
                    </TableCell>
                    {area === "console" ? (
                      <TableCell>
                        <Badge variant="secondary">
                          {KB_STATUS_LABEL[row.status]}
                        </Badge>
                      </TableCell>
                    ) : null}
                    <TableCell className="font-mono text-xs">
                      {row.currentVersion
                        ? `R${row.currentVersion.version}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.effectiveDate
                        ? formatTicketDate(row.effectiveDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.nextReviewAt
                        ? formatTicketDate(row.nextReviewAt)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <TableActions>
                        <TableActionLink
                          href={`${base}/${row.idDocument}`}
                          label={area === "portal" ? "Read" : "Open"}
                          icon={Eye}
                        />
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            itemLabel="documents"
          />
        </>
      )}
    </DashboardLayout>
  )
}
