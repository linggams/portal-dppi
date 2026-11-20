/**
 * Parse date-only `YYYY-MM-DD` as local calendar date (avoids UTC shift),
 * or a full ISO/datetime string / Date.
 */
function parseDateInput(
  value: string | Date | null | undefined
): Date | null {
  if (value == null || value === "") return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const trimmed = value.trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (dateOnly) {
    const year = Number(dateOnly[1])
    const month = Number(dateOnly[2])
    const day = Number(dateOnly[3])
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Format a date (or YYYY-MM-DD) as DD/MM/YYYY. */
export function formatDateId(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  const date = parseDateInput(value)
  if (!date) return fallback
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = String(date.getFullYear())
  return `${dd}/${mm}/${yyyy}`
}

/** Format a timestamp as DD/MM/YYYY HH:mm (Asia/Jakarta). */
export function formatDateTimeId(
  value: string | Date | null | undefined,
  fallback = "—"
): string {
  if (value == null || value === "") return fallback
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return fallback

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""

  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`
}
