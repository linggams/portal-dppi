import { Fragment } from "react"
import { TableContainer } from "@/components/ui/table-container"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { groupMeta, type LaporanGroup } from "@/lib/purchasing/laporan-group"

interface Props {
  tab: string
  groups: LaporanGroup[]
  columns: string[]
  renderRow: (item: Record<string, unknown>) => React.ReactNode
  renderSubtotal: (group: LaporanGroup) => React.ReactNode
}

export function LaporanKategoriTables({
  tab,
  groups,
  columns,
  renderRow,
  renderSubtotal,
}: Props) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.kategori}>
          <div className="flex items-center justify-between gap-3 rounded-t-md border border-b-0 bg-muted px-3 py-2">
            <span className="font-semibold">{group.kategori}</span>
            <span className="text-sm text-muted-foreground">
              {groupMeta(group, tab)}
            </span>
          </div>
          <TableContainer className="rounded-t-none">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.rows.map((item, index) => (
                  <Fragment
                    key={String(
                      item.idPermintaan ??
                        item.idPengajuan ??
                        item.idKodeBrg ??
                        item.id ??
                        index
                    )}
                  >
                    {renderRow(item)}
                  </Fragment>
                ))}
                {renderSubtotal(group)}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ))}
    </div>
  )
}
