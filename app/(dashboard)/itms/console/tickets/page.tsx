"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { DashboardLayout, ContentEmpty, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from "@/components/itms/StatusBadge"
import { formatTicketDate } from "@/lib/itms/format"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { ItmsPriority, ItmsTicketStatus } from "@prisma/client"

type TicketRow = {
  idTicket: number
  number: string
  title: string
  status: ItmsTicketStatus
  priority: ItmsPriority
  createdAt: string
  category: { name: string }
  requester: { username: string }
  assignee: { username: string } | null
}

type ViewKey = "all" | "unassigned" | "me"

export default function ItmsConsoleTicketsPage() {
  const [view, setView] = useState<ViewKey>("all")
  const [rows, setRows] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (view === "unassigned") params.set("assignee", "unassigned")
      if (view === "me") params.set("assignee", "me")
      const res = await fetch(`/api/itms/tickets?${params}`)
      if (!res.ok) throw new Error("Failed")
      const data = readPaginatedJson<TicketRow>(await res.json())
      setRows(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPageSize(data.pageSize)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, view])

  useEffect(() => {
    load()
  }, [load])

  return (
    <DashboardLayout title="Ticket Queue">
      <PageActions>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["unassigned", "Unassigned"],
              ["me", "My tickets"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={view === key ? "default" : "outline"}
              onClick={() => {
                setView(key)
                setPage(1)
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </PageActions>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <ContentEmpty title="No tickets in this view" />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.idTicket}>
                    <TableCell className="font-medium">{row.number}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.requester.username}</TableCell>
                    <TableCell>
                      <TicketPriorityBadge priority={row.priority} />
                    </TableCell>
                    <TableCell>
                      <TicketStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>{row.assignee?.username ?? "—"}</TableCell>
                    <TableCell>{formatTicketDate(row.createdAt)}</TableCell>
                    <TableCell>
                      <TableActions>
                        <TableActionLink
                          href={`/itms/console/tickets/${row.idTicket}`}
                          label="Open"
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
            itemLabel="tickets"
          />
        </>
      )}
    </DashboardLayout>
  )
}
