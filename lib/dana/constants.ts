export const DANA_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  CANCELLED: 3,
} as const

export const DANA_STATUS_LABEL: Record<number, string> = {
  [DANA_STATUS.PENDING]: "Pending",
  [DANA_STATUS.APPROVED]: "Disetujui",
  [DANA_STATUS.REJECTED]: "Ditolak",
  [DANA_STATUS.CANCELLED]: "Dibatalkan",
}

export const DANA_NOMINAL_MAX = 2_000_000_000
export const DANA_KEPERLUAN_MAX = 1000
export const DANA_ALASAN_MAX = 500

export function isDanaEditable(status: number) {
  return status === DANA_STATUS.PENDING || status === DANA_STATUS.REJECTED
}

export function isDanaCancellable(status: number) {
  return status === DANA_STATUS.PENDING
}

export function isDanaApprovable(status: number) {
  return status === DANA_STATUS.PENDING
}

export function isDanaPrintable(status: number) {
  return status === DANA_STATUS.APPROVED
}

export function isDanaKembalianEditable(status: number) {
  return status === DANA_STATUS.APPROVED
}

export function danaTerpakai(nominal: number, kembalian: number) {
  return Math.max(0, nominal - kembalian)
}
