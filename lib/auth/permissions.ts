import type { AppUserLevel } from "@/lib/auth/user-level"
import {
  resolveCapabilities,
  SYSTEM_ROLE_HOME_PATH,
  type AccessPrincipal,
} from "@/lib/auth/capabilities"

export type { AccessPrincipal, RoleCapabilities } from "@/lib/auth/capabilities"

type AccessInput = string | AccessPrincipal

export function isAdministrator(input: AccessInput): boolean {
  return resolveCapabilities(input).platform
}

export function isClientUser(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return (
    caps.purchasingUser &&
    !caps.purchasingWorkflow &&
    !caps.purchasingMaster &&
    !caps.platform
  )
}

export function isItSupport(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return caps.itStaff && !caps.platform
}

export function canAccessPlatform(input: AccessInput): boolean {
  return resolveCapabilities(input).platform
}

export function canAccessItStaff(input: AccessInput): boolean {
  return resolveCapabilities(input).itStaff
}

export function canAccessPurchasingUser(input: AccessInput): boolean {
  return resolveCapabilities(input).purchasingUser
}

export function canAccessItUser(input: AccessInput): boolean {
  return resolveCapabilities(input).itUser
}

export function canManagePurchasingMaster(input: AccessInput): boolean {
  return resolveCapabilities(input).purchasingMaster
}

export function canHandlePurchasingWorkflow(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return caps.purchasingWorkflow || caps.purchasingMaster
}

export function canReadPurchasingTransactions(input: AccessInput): boolean {
  return canAccessPurchasingUser(input) || canHandlePurchasingWorkflow(input)
}

export function getDefaultHomePath(input: AccessInput): string {
  if (typeof input !== "string" && input.homePath) {
    return input.homePath
  }

  if (canAccessPlatform(input)) {
    return SYSTEM_ROLE_HOME_PATH.administrator
  }

  return SYSTEM_ROLE_HOME_PATH.user
}

export function canAccessDanaUser(input: AccessInput): boolean {
  return resolveCapabilities(input).purchasingUser
}

export function canHandleDanaWorkflow(input: AccessInput): boolean {
  return resolveCapabilities(input).danaWorkflow
}

export function canAccessUiPath(input: AccessInput, pathname: string): boolean {
  if (pathname.startsWith("/platform")) {
    return canAccessPlatform(input)
  }

  if (pathname.startsWith("/purchasing/user")) {
    return canAccessPurchasingUser(input)
  }

  if (pathname.startsWith("/purchasing/admin")) {
    return canHandlePurchasingWorkflow(input)
  }

  if (pathname.startsWith("/it/staff")) {
    return canAccessItStaff(input)
  }

  if (pathname.startsWith("/it/user")) {
    return canAccessItUser(input)
  }

  if (pathname.startsWith("/dana/user")) {
    return canAccessDanaUser(input)
  }

  if (pathname.startsWith("/dana/admin")) {
    return canHandleDanaWorkflow(input)
  }

  if (pathname === "/unauthorized") return true

  return false
}

export function shouldFetchPurchasingKategori(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return caps.purchasingUser || caps.purchasingMaster
}

/** @deprecated Gunakan AccessPrincipal; tetap ada untuk kompatibilitas level. */
export type { AppUserLevel }
