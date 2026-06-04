export const IT_TIKET_STATUS = {
  BARU: 0,
  DITUGASKAN: 1,
  SEDANG_DIKERJAKAN: 2,
  MENUNGGU_USER: 3,
  SELESAI: 4,
  DITUTUP: 5,
  DIBATALKAN: 6,
} as const

export type ItTiketStatusCode =
  (typeof IT_TIKET_STATUS)[keyof typeof IT_TIKET_STATUS]

export const IT_TIKET_STATUS_LABEL: Record<number, string> = {
  0: "Baru",
  1: "Ditugaskan",
  2: "Sedang dikerjakan",
  3: "Menunggu user",
  4: "Selesai",
  5: "Ditutup",
  6: "Dibatalkan",
}

export const IT_PRIORITAS = ["rendah", "sedang", "tinggi", "kritis"] as const
export type ItPrioritas = (typeof IT_PRIORITAS)[number]

export const IT_PRIORITAS_LABEL: Record<string, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
  kritis: "Kritis",
}

export function isItStaff(level: string) {
  return level === "it_support" || level === "administrator"
}

export function canManageItTiket(level: string) {
  return isItStaff(level)
}

/** User boleh membatalkan tiket sendiri jika belum ditangani tim IT. */
export function canUserCancelTiket(status: number): boolean {
  return status === IT_TIKET_STATUS.BARU
}
