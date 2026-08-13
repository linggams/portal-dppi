import { IT_TIKET_STATUS } from "@/lib/it/constants"

/** Status yang masih menunggu penanganan IT. */
export const IT_QUEUE_ACTIVE_STATUSES: number[] = [
  IT_TIKET_STATUS.BARU,
  IT_TIKET_STATUS.DITUGASKAN,
  IT_TIKET_STATUS.SEDANG_DIKERJAKAN,
  IT_TIKET_STATUS.MENUNGGU_USER,
]

export function isTiketInQueue(status: number): boolean {
  return IT_QUEUE_ACTIVE_STATUSES.includes(status)
}
