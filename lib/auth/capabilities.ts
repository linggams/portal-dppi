import {
  normalizeUserLevel,
  type AppUserLevel,
} from "@/lib/auth/user-level"

export type ManagerModules = {
  managePurchasing: boolean
  manageIt: boolean
  manageDana: boolean
}

export type RoleCapabilities = {
  platform: boolean
  purchasingUser: boolean
  purchasingWorkflow: boolean
  purchasingMaster: boolean
  itUser: boolean
  itStaff: boolean
  danaWorkflow: boolean
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
  canAccessItUser: boolean
  canAccessItStaff: boolean
}

export const EMPTY_CAPABILITIES: RoleCapabilities = {
  platform: false,
  purchasingUser: false,
  purchasingWorkflow: false,
  purchasingMaster: false,
  itUser: false,
  itStaff: false,
  danaWorkflow: false,
}

export const SYSTEM_ROLE_HOME_PATH: Record<AppUserLevel, string> = {
  administrator: "/platform/dashboard",
  user: "/purchasing/user/dashboard",
}

export const SYSTEM_ROLE_CAPABILITIES: Record<AppUserLevel, RoleCapabilities> = {
  administrator: {
    platform: true,
    purchasingUser: true,
    purchasingWorkflow: true,
    purchasingMaster: true,
    itUser: true,
    itStaff: true,
    danaWorkflow: true,
  },
  user: {
    ...EMPTY_CAPABILITIES,
    purchasingUser: true,
    itUser: true,
  },
}

export const SYSTEM_ROLES = [
  {
    code: "administrator" as const,
    name: "Pengelola",
    description: "Akses penuh: kelola user, stok, approve, tiket IT, dan pengajuan dana",
    isSystem: true,
    homePath: SYSTEM_ROLE_HOME_PATH.administrator,
    canAccessPlatform: true,
    canAccessPurchasingUser: true,
    canHandlePurchasingWorkflow: true,
    canManagePurchasingMaster: true,
    canAccessItUser: true,
    canAccessItStaff: true,
  },
  {
    code: "user" as const,
    name: "Pemohon",
    description: "Ajukan permintaan ATK, tiket gangguan, dan pengajuan dana",
    isSystem: true,
    homePath: SYSTEM_ROLE_HOME_PATH.user,
    canAccessPlatform: false,
    canAccessPurchasingUser: true,
    canHandlePurchasingWorkflow: false,
    canManagePurchasingMaster: false,
    canAccessItUser: true,
    canAccessItStaff: false,
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
    itUser: role.canAccessItUser,
    itStaff: role.canAccessItStaff,
    danaWorkflow: false,
  }
}

export function applyManagerModules(
  caps: RoleCapabilities,
  modules: ManagerModules
): RoleCapabilities {
  if (!caps.platform) {
    return { ...caps, danaWorkflow: false }
  }

  return {
    platform: true,
    purchasingUser: false,
    purchasingWorkflow: modules.managePurchasing,
    purchasingMaster: modules.managePurchasing,
    itUser: false,
    itStaff: modules.manageIt,
    danaWorkflow: modules.manageDana,
  }
}

export function hydrateCapabilities(
  caps: RoleCapabilities | null | undefined,
  level: string
): RoleCapabilities {
  if (!caps) return capabilitiesFromLevel(level)
  return {
    ...EMPTY_CAPABILITIES,
    ...caps,
    danaWorkflow: caps.danaWorkflow ?? caps.platform,
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

export function isSystemRoleCode(code: string): boolean {
  return SYSTEM_ROLES.some((role) => role.code === code)
}

export function legacyLevelFromCapabilities(
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
