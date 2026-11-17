import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { Badge } from "@/components/ui/badge"
import type { DashboardItmsTicketItem } from "@/lib/platform/dashboard-types"
import { ITMS_PRIORITY_LABEL, ITMS_STATUS_LABEL } from "@/lib/itms/constants"
import type { ItmsPriority, ItmsTicketStatus } from "@prisma/client"

type Props = {
  items: DashboardItmsTicketItem[]
}

export function DashboardItmsBaruList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No new IT tickets.
        <div className="mt-3">
          <Button asChild size="sm" variant="outline">
            <Link href="/itms/console/tickets">Open ticket queue</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idTicket}>
                <TableCell className="font-medium">{item.number}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ITMS_PRIORITY_LABEL[item.priority as ItmsPriority] ??
                      item.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ITMS_STATUS_LABEL[item.status as ItmsTicketStatus] ??
                    item.status}
                </TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/itms/console/tickets/${item.idTicket}`}>
                      Open
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button asChild size="sm" variant="outline">
        <Link href="/itms/console/tickets">Open ticket queue</Link>
      </Button>
    </div>
  )
}
