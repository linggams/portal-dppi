/** Zona waktu operasional purchasing (WIB). */
export const PURCHASING_TIMEZONE = "Asia/Jakarta"

export const PERMINTAAN_DAILY_LIMIT_MESSAGE =
  "Anda sudah mengajukan permintaan hari ini. Permintaan berikutnya dapat diajukan besok."

/** Tanggal hari ini dalam WIB, format YYYY-MM-DD. Aman dipakai di client & server. */
export function getTodayDateWIB(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PURCHASING_TIMEZONE,
  }).format(new Date())
}

/** Parse YYYY-MM-DD untuk kolom @db.Date di Prisma. */
export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`)
}

export interface PermintaanDailyLimitStatus {
  date: string
  alreadySubmitted: boolean
  canAddItems: boolean
  canSubmit: boolean
}

export function buildPermintaanDailyLimitStatus(
  alreadySubmitted: boolean
): PermintaanDailyLimitStatus {
  return {
    date: getTodayDateWIB(),
    alreadySubmitted,
    canAddItems: !alreadySubmitted,
    canSubmit: !alreadySubmitted,
  }
}
