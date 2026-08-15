/** Validasi jam HH:mm (00:00–23:59). */
export function isValidJamHm(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export function parseJamHm(raw: unknown): string | null {
  const value = String(raw ?? "").trim()
  if (!isValidJamHm(value)) return null
  return value
}
