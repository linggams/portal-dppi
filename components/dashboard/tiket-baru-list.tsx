import Link from "next/link"
import { Eye } from "lucide-react"
import { ContentEmpty } from "@/components/layout/content-empty"
import { Button } from "@/components/ui/button"
import { TableActionLink } from "@/components/ui/table-actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { IT_TIKET_STATUS_LABEL } from "@/lib/it/constants"
import type { DashboardTiketItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardTiketItem[]
}

export function DashboardTiketBaruList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Tidak ada tiket baru"
        description="Belum ada tiket IT yang menunggu penanganan."
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
              <TableHead>No. Tiket</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idTiket}>
                <TableCell className="font-medium">{item.nomorTiket}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {item.judul}
                </TableCell>
                <TableCell>
                  {IT_TIKET_STATUS_LABEL[item.status] ?? item.status}
                </TableCell>
                <TableCell className="text-right">
                  <TableActionLink
                    label="Detail"
                    icon={Eye}
                    href={`/it/staff/tiket/${item.idTiket}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/it/staff/tiket">Buka antrian tiket</Link>
        </Button>
      </div>
    </div>
  )
}
