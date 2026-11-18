import { Fragment } from "react"
import { TableContainer } from "@/components/ui/table-container"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  isTransaksiTab,
  leafMeta,
  type LaporanLeafGroup,
  type LaporanSection,
} from "@/lib/purchasing/laporan-group"
import { cn } from "@/lib/utils"

const borderedTableClass =
  "border-collapse [&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border"

interface Props {
  tab: string
  sections: LaporanSection[]
  columns: string[]
  /** Tampilkan header leaf (default: false untuk transaksi tanggal) */
  showLeafHeader?: boolean
  leafHeaderPrefix?: string
  formatSectionTitle?: (title: string) => string
  renderRow: (item: Record<string, unknown>) => React.ReactNode
  renderLeafSubtotal: (group: LaporanLeafGroup) => React.ReactNode
  renderSectionSubtotal?: (section: LaporanSection) => React.ReactNode
  renderGrandTotal?: () => React.ReactNode
}

function BorderedTable({
  columns,
  children,
}: {
  columns: string[]
  children: React.ReactNode
}) {
  return (
    <TableContainer className="rounded-none border-0">
      <Table className={borderedTableClass}>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead key={column} className="font-semibold">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  )
}

export function LaporanGroupedTables({
  tab,
  sections,
  columns,
  showLeafHeader,
  leafHeaderPrefix = "Kategori",
  formatSectionTitle,
  renderRow,
  renderLeafSubtotal,
  renderSectionSubtotal,
  renderGrandTotal,
}: Props) {
  if (sections.length === 0) return null
  const transaksi = isTransaksiTab(tab)
  const leafHeader = showLeafHeader ?? !transaksi

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.key} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 border-l-4 border-l-primary pl-3">
            <h3 className="text-sm font-semibold tracking-tight sm:text-base">
              {formatSectionTitle
                ? formatSectionTitle(section.title)
                : section.title}
            </h3>
            <span className="text-xs text-muted-foreground sm:text-sm">
              {section.itemCount} item
              {transaksi && section.users.length > 0
                ? ` · ${section.users.length} user`
                : ""}
              {transaksi ? ` · jml ${section.jumlah}` : ""}
            </span>
          </div>

          <div className="space-y-3">
            {section.groups.map((group) => (
              <div
                key={`${section.key}-${group.key}`}
                className="overflow-hidden rounded-md border border-border"
              >
                {leafHeader ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-muted px-3 py-2">
                    <span className="text-sm font-medium">
                      {leafHeaderPrefix}: {group.label}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground sm:text-sm">
                      {leafMeta(group, tab)}
                    </span>
                  </div>
                ) : null}
                <BorderedTable columns={columns}>
                  {group.rows.map((item, index) => (
                    <Fragment
                      key={String(
                        item.idPermintaan ??
                          item.idPengajuan ??
                          item.idKodeBrg ??
                          item.id ??
                          `${group.key}-${index}`
                      )}
                    >
                      {renderRow(item)}
                    </Fragment>
                  ))}
                  {renderLeafSubtotal(group)}
                </BorderedTable>
              </div>
            ))}
          </div>

          {transaksi && renderSectionSubtotal && section.groups.length > 1 ? (
            <div className="overflow-hidden rounded-md border border-border">
              <Table className={cn(borderedTableClass, "w-full text-sm")}>
                <TableBody>{renderSectionSubtotal(section)}</TableBody>
              </Table>
            </div>
          ) : null}
        </div>
      ))}

      {renderGrandTotal ? (
        <div className="overflow-hidden rounded-md border border-border">
          <Table className={cn(borderedTableClass, "w-full text-sm")}>
            <TableBody>{renderGrandTotal()}</TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}

export function SubtotalRow({
  label,
  colSpanLabel,
  children,
  tone = "default",
}: {
  label: string
  colSpanLabel: number
  children: React.ReactNode
  tone?: "default" | "section" | "grand"
}) {
  return (
    <TableRow
      className={cn(
        "hover:bg-transparent",
        tone === "section" && "bg-muted/40",
        tone === "grand" && "bg-muted font-semibold"
      )}
    >
      <TableCell colSpan={colSpanLabel} className="font-medium">
        {label}
      </TableCell>
      {children}
    </TableRow>
  )
}
