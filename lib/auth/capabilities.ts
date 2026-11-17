import {
  normalizeUserLevel,
  type AppUserLevel,
} from "@/lib/auth/user-level"

export type ManagerModules = {
  managePurchasing: boolean
  manageItms: boolean
  manageMobil: boolean
}

export type ApplicantModules = {
  accessPurchasing: boolean
  accessItms: boolean
  accessMobil: boolean
}

export type RoleCapabilities = {
  platform: boolean
  purchasingUser: boolean
  purchasingWorkflow: boolean
  purchasingMaster: boolean
  itmsUser: boolean
  itmsStaff: boolean
  mobilUser: boolean
  mobilWorkflow: boolean
}

export type AccessPrincipal = {
  level?: string
  capabilities?: RoleCapabilities | null
  homePath?: string | null
  roleName?: string | null
}

export type RoleCapabilityFields = {
  canAccessPlatform: boolean
  canAccessPurchasingUser: boolean
  canHandlePurchasingWorkflow: boolean
  canManagePurchasingMaster: boolean
}

export const EMPTY_CAPABILITIES: RoleCapabilities = {
  platform: false,
  purchasingUser: false,
  purchasingWorkflow: false,
  purchasingMaster: false,
  itmsUser: false,
  itmsStaff: false,
  mobilUser: false,
  mobilWorkflow: false,
}

export const SYSTEM_ROLE_HOME_PATH: Record<AppUserLevel, string> = {
  administrator: "/platform/dashboard",
  user: "/purchasing/user/dashboard",
}

const SYSTEM_ROLE_CAPABILITIES: Record<AppUserLevel, RoleCapabilities> = {
  administrator: {
    platform: true,
    purchasingUser: true,
    purchasingWorkflow: true,
    purchasingMaster: true,
    itmsUser: true,
    itmsStaff: true,
    mobilUser: true,
    mobilWorkflow: true,
  },
  user: {
    ...EMPTY_CAPABILITIES,
    purchasingUser: true,
    itmsUser: true,
    mobilUser: true,
  },
}

export const SYSTEM_ROLES = [
  {
    code: "administrator" as const,
    name: "Pengelola",
    description:
      "Akses penuh: kelola user, stok, approve, IT Management, dan mobil",
    isSystem: true,
    homePath: SYSTEM_ROLE_HOME_PATH.administrator,
    canAccessPlatform: true,
    canAccessPurchasingUser: true,
    canHandlePurchasingWorkflow: true,
    canManagePurchasingMaster: true,
  },
  {
    code: "user" as const,
    name: "Pemohon",
    description:
      "Ajukan permintaan ATK, tiket IT Management, dan laporan KM mobil",
    isSystem: true,
    homePath: SYSTEM_ROLE_HOME_PATH.user,
    canAccessPlatform: false,
    canAccessPurchasingUser: true,
    canHandlePurchasingWorkflow: false,
    canManagePurchasingMaster: false,
  },
] as const

export function capabilitiesFromLevel(level: string): RoleCapabilities {
  return SYSTEM_ROLE_CAPABILITIES[normalizeUserLevel(level)]
}

export function capabilitiesFromRole(
  role: RoleCapabilityFields
): RoleCapabilities {
  return {
    platform: role.canAccessPlatform,
    purchasingUser: role.canAccessPurchasingUser,
    purchasingWorkflow: role.canHandlePurchasingWorkflow,
    purchasingMaster: role.canManagePurchasingMaster,
    itmsUser: false,
    itmsStaff: false,
    mobilUser: false,
    mobilWorkflow: false,
  }
}

/** Overlay per-user module flags onto role capabilities. */
export function applyUserModules(
  caps: RoleCapabilities,
  manager: ManagerModules,
  applicant: ApplicantModules
): RoleCapabilities {
  if (caps.platform) {
    return {
      platform: true,
      purchasingUser: false,
      purchasingWorkflow: manager.managePurchasing,
      purchasingMaster: manager.managePurchasing,
      itmsUser: false,
      itmsStaff: manager.manageItms,
      mobilUser: manager.manageMobil,
      mobilWorkflow: manager.manageMobil,
    }
  }

  return {
    platform: false,
    purchasingUser: applicant.accessPurchasing,
    purchasingWorkflow: false,
    purchasingMaster: false,
    itmsUser: applicant.accessItms,
    itmsStaff: false,
    mobilUser: applicant.accessMobil,
    mobilWorkflow: false,
  }
}

export function homePathFromCapabilities(caps: RoleCapabilities): string {
  if (caps.platform) return SYSTEM_ROLE_HOME_PATH.administrator
  if (caps.purchasingUser) return "/purchasing/user/dashboard"
  if (caps.itmsUser) return "/itms/portal"
  if (caps.mobilUser) return "/mobil/user/laporan"
  return "/unauthorized"
}

export function hydrateCapabilities(
  caps: RoleCapabilities | null | undefined,
  level: string
): RoleCapabilities {
  if (!caps) return capabilitiesFromLevel(level)
  const platform = Boolean(caps.platform)
  return {
    ...EMPTY_CAPABILITIES,
    ...caps,
    itmsUser: caps.itmsUser ?? false,
    itmsStaff: caps.itmsStaff ?? false,
    mobilWorkflow: caps.mobilWorkflow ?? platform,
    mobilUser: caps.mobilUser ?? !platform,
  }
}

export function resolveCapabilities(
  input: string | AccessPrincipal
): RoleCapabilities {
  if (typeof input === "string") {
    return capabilitiesFromLevel(input)
  }
  if (input.capabilities) {
    return hydrateCapabilities(input.capabilities, input.level ?? "user")
  }
  if (input.level) {
    return capabilitiesFromLevel(input.level)
  }
  return EMPTY_CAPABILITIES
}

function legacyLevelFromCapabilities(
  caps: RoleCapabilities
): AppUserLevel {
  return caps.platform ? "administrator" : "user"
}

export function legacyLevelFromRole(role: {
  code: string
} & RoleCapabilityFields): AppUserLevel {
  if (role.code === "administrator" || role.code === "user") {
    return role.code
  }
  return legacyLevelFromCapabilities(capabilitiesFromRole(role))
}
