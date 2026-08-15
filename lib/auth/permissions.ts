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

  const caps = resolveCapabilities(input)
  if (caps.platform) {
    return SYSTEM_ROLE_HOME_PATH.administrator
  }
  if (caps.purchasingUser) return "/purchasing/user/dashboard"
  if (caps.itUser) return "/it/user/tiket"
  if (caps.danaUser) return "/dana/user/pengajuan"
  if (caps.mobilUser) return "/mobil/user/laporan"

  return SYSTEM_ROLE_HOME_PATH.user
}

export function canAccessDanaUser(input: AccessInput): boolean {
  return resolveCapabilities(input).danaUser
}

export function canHandleDanaWorkflow(input: AccessInput): boolean {
  return resolveCapabilities(input).danaWorkflow
}

/** Baca pengajuan dana: pemohon (user) atau pengelola modul dana. */
export function canAccessDana(input: AccessInput): boolean {
  return canAccessDanaUser(input) || canHandleDanaWorkflow(input)
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

  if (pathname.startsWith("/mobil/user")) {
    return canAccessMobil(input)
  }

  if (pathname.startsWith("/mobil/admin")) {
    return canHandleMobilWorkflow(input)
  }

  if (pathname === "/unauthorized") return true

  return false
}

export function shouldFetchPurchasingKategori(input: AccessInput): boolean {
  const caps = resolveCapabilities(input)
  return caps.purchasingUser || caps.purchasingMaster
}
