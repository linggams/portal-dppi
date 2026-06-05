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

export type TiketQueueSortable = {
  idTiket: number
  status: number
  tglDibuat: Date | string
}

export function compareTiketQueueOrder(
  a: TiketQueueSortable,
  b: TiketQueueSortable
): number {
  const timeA = new Date(a.tglDibuat).getTime()
  const timeB = new Date(b.tglDibuat).getTime()
  return timeA - timeB
}

/** Urutkan antrian global dan kembalikan peta idTiket → posisi (1-based). */
export function buildQueuePositionMap(
  tickets: TiketQueueSortable[]
): Map<number, number> {
  const sorted = tickets
    .filter((t) => isTiketInQueue(t.status))
    .sort(compareTiketQueueOrder)

  const map = new Map<number, number>()
  sorted.forEach((t, index) => {
    map.set(t.idTiket, index + 1)
  })
  return map
}

export function getQueuePosition(
  idTiket: number,
  positionMap: Map<number, number>
): number | null {
  return positionMap.get(idTiket) ?? null
}
