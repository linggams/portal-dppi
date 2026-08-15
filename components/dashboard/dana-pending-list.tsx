import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"
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
import { formatRupiah } from "@/lib/dana/format"
import type { DashboardDanaItem } from "@/lib/platform/dashboard-types"

interface Props {
  items: DashboardDanaItem[]
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

export function DashboardDanaPendingList({ items }: Props) {
  if (items.length === 0) {
    return (
      <ContentEmpty
        title="Tidak ada pengajuan pending"
        description="Semua pengajuan dana sudah diproses."
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
              <TableHead>Nomor</TableHead>
              <TableHead>Pemohon</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idPengajuan}>
                <TableCell className="font-medium">{item.nomor}</TableCell>
                <TableCell>
                  <div className="font-medium">{item.username}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.jabatan}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatRupiah(item.nominal)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(item.tglDibuat)}
                </TableCell>
                <TableCell className="text-right">
                  <TableActionLink
                    label="Detail"
                    icon={Eye}
                    href={`/dana/admin/antrian/${item.idPengajuan}`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end">
        <Button asChild variant="link" size="sm" className="h-auto p-0">
          <Link href="/dana/admin/antrian">Buka antrian dana</Link>
        </Button>
      </div>
    </div>
  )
}
