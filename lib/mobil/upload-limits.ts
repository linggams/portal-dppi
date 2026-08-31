/** Shared client-safe limits (no Node fs). */
export const MOBIL_BUKTI_MAX_BYTES = 2 * 1024 * 1024
export const MOBIL_BUKTI_MAX_MB = MOBIL_BUKTI_MAX_BYTES / (1024 * 1024)
export const MOBIL_BUKTI_PLACEHOLDER = `JPG, maks ${MOBIL_BUKTI_MAX_MB} MB`
