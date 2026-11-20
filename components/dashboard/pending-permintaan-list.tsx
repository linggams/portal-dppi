import Link from "next/link"
import { Eye } from "lucide-react"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Button } from "@/components/ui/button"
import { TableActionLink, TableActions } from "@/components/ui/table-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { getGroupStatusBadge } from "@/lib/purchasing/permintaan-status"
import { formatDateId } from "@/lib/shared/date"
import type { DashboardPermintaanItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardPermintaanItem[]
}

function formatDate(dateString: string) {
  return formatDateId(dateString, dateString)
}

export function DashboardPendingPermintaanList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="No pending requests"
        description="All requests have been processed."
        className="py-8"
      />
    )
  }

  return (
    <div className="space-y-4">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Item</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const detailHref = `/purchasing/admin/permintaan/detail?unit=${encodeURIComponent(item.unit)}&tgl=${item.tglPermintaan}`

              return (
                <TableRow key={`${item.unit}-${item.tglPermintaan}`}>
                  <TableCell className="font-medium">{item.unit}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(item.tglPermintaan)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.jumlahItem}
                  </TableCell>
                  <TableCell>
                    {getGroupStatusBadge(item)}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableActions>
                      <TableActionLink
                        label="Detail"
                        icon={Eye}
                        href={detailHref}
                      />
                    </TableActions>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/purchasing/admin/permintaan/data?status=0">
            View all requests
          </Link>
        </Button>
      </div>
    </div>
  )
}
