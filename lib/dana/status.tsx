import { Badge } from "@/components/ui/badge"
import { DANA_STATUS, DANA_STATUS_LABEL } from "./constants"

export function getDanaStatusBadge(status: number) {
  const label = DANA_STATUS_LABEL[status] ?? String(status)

  switch (status) {
    case DANA_STATUS.PENDING:
      return <Badge variant="outline">{label}</Badge>
    case DANA_STATUS.APPROVED:
      return <Badge variant="default">{label}</Badge>
    case DANA_STATUS.REJECTED:
      return <Badge variant="destructive">{label}</Badge>
    case DANA_STATUS.CANCELLED:
      return <Badge variant="secondary">{label}</Badge>
    default:
      return <Badge>{label}</Badge>
  }
}
