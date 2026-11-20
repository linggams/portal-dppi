import { formatDateId, formatDateTimeId } from "@/lib/shared/date"

/** Ticket/SOP timestamps: DD/MM/YYYY HH:mm (WIB). */
export function formatTicketDate(value: string | Date) {
  return formatDateTimeId(value)
}

/** Date-only fields (warranty, effective date): DD/MM/YYYY. */
export function formatTicketDateOnly(value: string | Date | null | undefined) {
  return formatDateId(value)
}
