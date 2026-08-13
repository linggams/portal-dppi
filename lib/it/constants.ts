import {
  resolveCapabilities,
  type AccessPrincipal,
} from "@/lib/auth/capabilities"

export const IT_TIKET_STATUS = {
  BARU: 0,
  DITUGASKAN: 1,
  SEDANG_DIKERJAKAN: 2,
  MENUNGGU_USER: 3,
  SELESAI: 4,
  DITUTUP: 5,
  DIBATALKAN: 6,
} as const

export const IT_TIKET_STATUS_LABEL: Record<number, string> = {
  0: "Baru",
  1: "Ditugaskan",
  2: "Sedang dikerjakan",
  3: "Menunggu user",
  4: "Selesai",
  5: "Ditutup",
  6: "Dibatalkan",
}

export function canManageItTiket(input: string | AccessPrincipal) {
  return resolveCapabilities(input).itStaff
}

/** User boleh membatalkan tiket sendiri jika belum ditangani tim IT. */
export function canUserCancelTiket(status: number): boolean {
  return status === IT_TIKET_STATUS.BARU
}
