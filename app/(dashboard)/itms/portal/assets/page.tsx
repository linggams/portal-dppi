"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { DashboardLayout, ContentEmpty } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
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
import { ASSET_STATUS_LABEL } from "@/lib/itms/assets"
import { DEFAULT_PAGE_SIZE, readPaginatedJson } from "@/lib/shared/pagination"
import type { ItmsAssetStatus } from "@prisma/client"

type AssetRow = {
  idAsset: number
  tag: string
  type: string
  brand: string
  model: string
  status: ItmsAssetStatus
  location: string
}

export default function ItmsMyAssetsPage() {
  const [rows, setRows] = useState<AssetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        mine: "true",
      })
      const res = await fetch(`/api/itms/assets?${params}`)
      if (!res.ok) throw new Error("Failed")
      const data = readPaginatedJson<AssetRow>(await res.json())
      setRows(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setPageSize(data.pageSize)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <DashboardLayout title="My Assets">
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : rows.length === 0 ? (
        <ContentEmpty
          title="No assets assigned to you"
          description="When IT assigns a device, it will appear here."
        />
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand / Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.idAsset}>
                    <TableCell className="font-medium">{row.tag}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>
                      {[row.brand, row.model].filter(Boolean).join(" ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ASSET_STATUS_LABEL[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.location || "—"}</TableCell>
                    <TableCell>
                      <TableActions>
                        <TableActionLink
                          href={`/itms/portal/assets/${row.idAsset}`}
                          label="View"
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
            itemLabel="assets"
          />
        </>
      )}
    </DashboardLayout>
  )
}
