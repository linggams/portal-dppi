import {
  normalizeUserLevel,
  type AppUserLevel,
} from "@/lib/auth/user-level"

export type ManagerModules = {
  managePurchasing: boolean
  manageIt: boolean
  manageDana: boolean
  manageMobil: boolean
}

export type ApplicantModules = {
  accessPurchasing: boolean
  accessIt: boolean
  accessDana: boolean
  accessMobil: boolean
}

export type RoleCapabilities = {
  platform: boolean
  purchasingUser: boolean
  purchasingWorkflow: boolean
  purchasingMaster: boolean
  itUser: boolean
  itStaff: boolean
  danaUser: boolean
  danaWorkflow: boolean
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
  danaUser: false,
  danaWorkflow: false,
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
    itUser: true,
    itStaff: true,
    danaUser: true,
    danaWorkflow: true,
    mobilUser: true,
    mobilWorkflow: true,
  },
  user: {
    ...EMPTY_CAPABILITIES,
    purchasingUser: true,
    itUser: true,
    danaUser: true,
    mobilUser: true,
  },
}

export const SYSTEM_ROLES = [
  {
    code: "administrator" as const,
    name: "Pengelola",
    description:
      "Akses penuh: kelola user, stok, approve, tiket IT, pengajuan dana, dan mobil",
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
    description:
      "Ajukan permintaan ATK, tiket gangguan, pengajuan dana, dan laporan KM mobil",
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
    danaUser: false,
    danaWorkflow: false,
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
      itUser: false,
      itStaff: manager.manageIt,
      danaUser: false,
      danaWorkflow: manager.manageDana,
      // Pengelola modul mobil juga boleh input laporan KM
      mobilUser: manager.manageMobil,
      mobilWorkflow: manager.manageMobil,
    }
  }

  return {
    platform: false,
    purchasingUser: applicant.accessPurchasing,
    purchasingWorkflow: false,
    purchasingMaster: false,
    itUser: applicant.accessIt,
    itStaff: false,
    danaUser: applicant.accessDana,
    danaWorkflow: false,
    mobilUser: applicant.accessMobil,
    mobilWorkflow: false,
  }
}

export function homePathFromCapabilities(caps: RoleCapabilities): string {
  if (caps.platform) return SYSTEM_ROLE_HOME_PATH.administrator
  if (caps.purchasingUser) return "/purchasing/user/dashboard"
  if (caps.itUser) return "/it/user/tiket"
  if (caps.danaUser) return "/dana/user/pengajuan"
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
    danaUser: caps.danaUser ?? (!platform && Boolean(caps.purchasingUser)),
    danaWorkflow: caps.danaWorkflow ?? platform,
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
