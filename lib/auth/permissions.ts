import {
  normalizeUserLevel,
  type AppUserLevel,
} from "@/lib/auth/user-level"

/** Halaman admin Purchasing untuk role `purchasing` (operasional, bukan master data). */
export const PURCHASING_STAFF_PATH_PREFIXES = [
  "/purchasing/admin/dashboard",
  "/purchasing/admin/permintaan",
  "/purchasing/admin/pengajuan",
] as const

export function isAdministrator(level: string): boolean {
  return normalizeUserLevel(level) === "administrator"
}

export function isPurchasingStaff(level: string): boolean {
  return normalizeUserLevel(level) === "purchasing"
}

export function isClientUser(level: string): boolean {
  return normalizeUserLevel(level) === "user"
}

export function isItSupport(level: string): boolean {
  return normalizeUserLevel(level) === "it_support"
}

export function canAccessPlatform(level: string): boolean {
  return isAdministrator(level)
}

export function canAccessItStaff(level: string): boolean {
  const l = normalizeUserLevel(level)
  return l === "it_support" || l === "administrator"
}

export function canAccessPurchasingUser(level: string): boolean {
  return isClientUser(level)
}

/** Portal tiket gangguan (buat & lihat tiket sendiri). */
export function canAccessItUser(level: string): boolean {
  const l = normalizeUserLevel(level)
  return l === "user" || l === "administrator"
}

/** Master data: stok CRUD, kategori, laporan. */
export function canManagePurchasingMaster(level: string): boolean {
  return isAdministrator(level)
}

/** Approve/tolak permintaan & pengajuan, lihat antrian operasional. */
export function canHandlePurchasingWorkflow(level: string): boolean {
  const l = normalizeUserLevel(level)
  return l === "administrator" || l === "purchasing"
}

/** GET daftar permintaan/pengajuan (client = milik sendiri, staff = semua). */
export function canReadPurchasingTransactions(level: string): boolean {
  return (
    isClientUser(level) || canHandlePurchasingWorkflow(level)
  )
}

export function canAccessPurchasingAdminPath(
  level: string,
  pathname: string
): boolean {
  const l = normalizeUserLevel(level)
  if (l === "administrator") return true
  if (l !== "purchasing") return false

  return PURCHASING_STAFF_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function getDefaultHomePath(level: string): string {
  const l = normalizeUserLevel(level)
  switch (l) {
    case "administrator":
      return "/platform/dashboard"
    case "purchasing":
      return "/purchasing/admin/dashboard"
    case "it_support":
      return "/it/staff/dashboard"
    case "user":
      return "/purchasing/user/dashboard"
    default:
      return "/unauthorized"
  }
}

export function canAccessUiPath(level: string, pathname: string): boolean {
  const l = normalizeUserLevel(level)

  if (l === "administrator") return true

  if (pathname.startsWith("/purchasing/user")) {
    return l === "user"
  }

  if (pathname.startsWith("/purchasing/admin")) {
    if (l === "user" || l === "it_support") return false
    if (l === "purchasing") {
      return canAccessPurchasingAdminPath(l, pathname)
    }
    return false
  }

  if (pathname.startsWith("/it/staff")) {
    return l === "it_support"
  }

  if (pathname.startsWith("/it/user")) {
    return canAccessItUser(l)
  }

  if (pathname.startsWith("/platform")) {
    return false
  }

  if (pathname === "/unauthorized") return true

  return false
}

export function shouldFetchPurchasingKategori(level: AppUserLevel): boolean {
  return level === "administrator" || level === "user"
}
