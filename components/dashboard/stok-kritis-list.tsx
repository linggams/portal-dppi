import Link from "next/link"
import { ContentEmpty } from "@/components/layout/content-empty"
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
import type { DashboardStokKritisItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardStokKritisItem[]
  total?: number
}

export function DashboardStokKritisList({ items, total }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Stock is healthy"
        description="No items with critical stock."
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
              <TableHead>Item code</TableHead>
              <TableHead>Item name</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.kodeBrg}>
                <TableCell className="font-medium">{item.kodeBrg}</TableCell>
                <TableCell>{item.namaBrg}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-destructive">
                  {item.sisa}
                </TableCell>
                <TableCell>{item.satuan}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {total != null && total > items.length ? (
        <p className="text-sm text-muted-foreground">
          +{total - items.length} more items with critical stock
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/purchasing/admin/kategori">Manage stock</Link>
        </Button>
      </div>
    </div>
  )
}
