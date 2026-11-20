import {
  resolveCapabilities,
  SYSTEM_ROLE_HOME_PATH,
  type AccessPrincipal,
} from "@/lib/auth/capabilities"

type AccessInput = string | AccessPrincipal

export function isClientUser(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return (
    caps.purchasingUser &&
    !caps.purchasingWorkflow &&
    !caps.purchasingMaster &&
    !caps.platform
  )
}

export function canAccessPlatform(input: AccessInput): boolean {
  return resolveCapabilities(input).platform
}

export function canAccessPurchasingUser(input: AccessInput): boolean {
  return resolveCapabilities(input).purchasingUser
}

export function canAccessItmsStaff(input: AccessInput): boolean {
  return resolveCapabilities(input).itmsStaff
}

export function canAccessItmsUser(input: AccessInput): boolean {
  return resolveCapabilities(input).itmsUser
}

export function canAccessItms(input: AccessInput): boolean {
  return canAccessItmsUser(input) || canAccessItmsStaff(input)
}

/** Read-only SOP Register + NIST Mapping for any operational user (pemohon / staff). */
export function canReadItmsLibrary(input: AccessInput): boolean {
  if (canAccessItms(input)) return true
  const caps = resolveCapabilities(input)
  return caps.purchasingUser || caps.mobilUser || caps.purchasingWorkflow || caps.purchasingMaster || caps.mobilWorkflow
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

export function getDefaultHomePath(_input: AccessInput): string {
  // Unified module hub for all roles.
  return "/home"
}

export function canAccessMobilUser(input: AccessInput): boolean {
  return resolveCapabilities(input).mobilUser
}

export function canHandleMobilWorkflow(input: AccessInput): boolean {
  return resolveCapabilities(input).mobilWorkflow
}

export function canAccessMobil(input: AccessInput): boolean {
  return canAccessMobilUser(input) || canHandleMobilWorkflow(input)
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

  if (pathname.startsWith("/itms/console")) {
    return canAccessItmsStaff(input)
  }

  if (
    pathname.startsWith("/itms/portal/sop") ||
    pathname.startsWith("/itms/portal/nist") ||
    pathname.startsWith("/itms/portal/knowledge")
  ) {
    return canReadItmsLibrary(input)
  }

  if (pathname.startsWith("/itms/portal") || pathname.startsWith("/itms")) {
    return canAccessItms(input)
  }

  if (pathname.startsWith("/mobil/user")) {
    return canAccessMobil(input)
  }

  if (pathname.startsWith("/mobil/admin")) {
    return canHandleMobilWorkflow(input)
  }

  if (
    pathname === "/unauthorized" ||
    pathname === "/home" ||
    pathname === "/" ||
    pathname.startsWith("/~offline") ||
    pathname.startsWith("/serwist")
  ) {
    return true
  }

  return false
}

export function shouldFetchPurchasingKategori(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return caps.purchasingUser || caps.purchasingMaster
}
