export type AppUserLevel = "user" | "administrator"

export function normalizeUserLevel(level: string): AppUserLevel {
  if (
    level === "user" ||
    level === "instansi" ||
    level === "pemohon"
  ) {
    return "user"
  }
  return "administrator"
}

export const USER_LEVEL_LABEL: Record<AppUserLevel, string> = {
  user: "Pemohon",
  administrator: "Pengelola",
}
