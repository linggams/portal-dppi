import type {
  ItmsImpact,
  ItmsPriority,
  ItmsTicketStatus,
  ItmsUrgency,
} from "@prisma/client"

export const ITMS_STATUS_LABEL: Record<ItmsTicketStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
}

export const ITMS_PRIORITY_LABEL: Record<ItmsPriority, string> = {
  p1: "P1 Critical",
  p2: "P2 High",
  p3: "P3 Medium",
  p4: "P4 Low",
}

/** PRD Impact × Urgency matrix */
export function computePriority(
  impact: ItmsImpact,
  urgency: ItmsUrgency
): ItmsPriority {
  const matrix: Record<ItmsImpact, Record<ItmsUrgency, ItmsPriority>> = {
    high: { high: "p1", medium: "p2", low: "p3" },
    medium: { high: "p2", medium: "p3", low: "p3" },
    low: { high: "p3", medium: "p3", low: "p4" },
  }
  return matrix[impact][urgency]
}

export function canRequesterCancelTicket(status: ItmsTicketStatus) {
  return status === "new"
}
