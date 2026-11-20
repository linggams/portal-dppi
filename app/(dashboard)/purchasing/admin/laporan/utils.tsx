import { Badge } from "@/components/ui/badge"
import { formatDateId } from "@/lib/shared/date"

export function formatDate(dateString: string): string {
  return formatDateId(dateString, dateString)
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return <Badge variant="outline">Pending</Badge>
    case 1:
      return <Badge variant="default">Approved</Badge>
    case 2:
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
