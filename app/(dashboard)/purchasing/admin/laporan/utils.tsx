import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
  } catch {
    return dateString
  }
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
      return <Badge variant="default">Disetujui</Badge>
    case 2:
      return <Badge variant="destructive">Ditolak</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}
