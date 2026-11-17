import { Badge } from "@/components/ui/badge"
import type { ItmsPriority, ItmsTicketStatus } from "@prisma/client"
import {
  ITMS_PRIORITY_LABEL,
  ITMS_STATUS_LABEL,
} from "@/lib/itms/constants"

const STATUS_VARIANT: Record<
  ItmsTicketStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  new: "default",
  assigned: "secondary",
  in_progress: "default",
  pending: "outline",
  resolved: "secondary",
  closed: "outline",
  cancelled: "destructive",
}

const PRIORITY_VARIANT: Record<
  ItmsPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  p1: "destructive",
  p2: "default",
  p3: "secondary",
  p4: "outline",
}

export function TicketStatusBadge({ status }: { status: ItmsTicketStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{ITMS_STATUS_LABEL[status]}</Badge>
  )
}

export function TicketPriorityBadge({ priority }: { priority: ItmsPriority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]}>
      {ITMS_PRIORITY_LABEL[priority]}
    </Badge>
  )
}
