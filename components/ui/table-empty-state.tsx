import { TableCell, TableRow } from "@/components/ui/table"
import { ContentEmpty } from "@/components/layout/content-empty"

interface TableEmptyStateProps {
  colSpan: number
  title?: string
  description?: string
}

export function TableEmptyState({
  colSpan,
  title,
  description,
}: TableEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0">
        <ContentEmpty title={title} description={description} />
      </TableCell>
    </TableRow>
  )
}
