export function computeSlaDeadlines(
  createdAt: Date,
  responseMinutes: number,
  resolutionMinutes: number
) {
  const dueResponseAt = new Date(createdAt.getTime() + responseMinutes * 60_000)
  const dueResolutionAt = new Date(
    createdAt.getTime() + resolutionMinutes * 60_000
  )
  return { dueResponseAt, dueResolutionAt }
}

/** Simple calendar-minute SLA for MVP (business hours later). */
export function minutesUntil(deadline: Date | null | undefined, now = new Date()) {
  if (!deadline) return null
  return Math.round((deadline.getTime() - now.getTime()) / 60_000)
}

export function slaState(
  deadline: Date | null | undefined,
  metAt?: Date | null,
  now = new Date()
): "met" | "ok" | "warning" | "breached" | "none" {
  if (!deadline) return "none"
  if (metAt && metAt.getTime() <= deadline.getTime()) return "met"
  const remaining = deadline.getTime() - now.getTime()
  if (remaining <= 0) return "breached"
  // Warn when < 20% of typical window left is unknown; use 30 minutes threshold
  if (remaining <= 30 * 60_000) return "warning"
  return "ok"
}
