export type AppUserLevel =
  | "user"
  | "administrator"
  | "it_support"
  | "purchasing"

export function normalizeUserLevel(level: string): AppUserLevel {
  if (level === "bendahara" || level === "admin") {
    return "administrator"
  }
  if (level === "it") {
    return "it_support"
  }
  if (level === "instansi") {
    return "user"
  }
  if (
    level === "user" ||
    level === "administrator" ||
    level === "it_support" ||
    level === "purchasing"
  ) {
    return level
  }
  return "user"
}

export const USER_LEVEL_LABEL: Record<AppUserLevel, string> = {
  user: "User",
  administrator: "Administrator",
  it_support: "IT Support",
  purchasing: "Purchasing",
}
