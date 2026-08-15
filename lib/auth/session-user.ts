import { USER_LEVEL_LABEL, normalizeUserLevel } from "@/lib/auth/user-level"
import {
  SYSTEM_ROLE_HOME_PATH,
  applyUserModules,
  capabilitiesFromLevel,
  capabilitiesFromRole,
  homePathFromCapabilities,
  hydrateCapabilities,
  type RoleCapabilities,
  type RoleCapabilityFields,
} from "@/lib/auth/capabilities"

type SessionAuthUser = {
  id: string
  username: string
  jabatan: string
  level: string
  roleName: string
  homePath: string
  capabilities: RoleCapabilities
}

type RoleForSession = RoleCapabilityFields & {
  code: string
  name: string
  homePath: string
}

export function buildSessionAuthUser(user: {
  idUser: number
  username: string
  jabatan: string
  level: string
  managePurchasing?: boolean
  manageIt?: boolean
  manageDana?: boolean
  manageMobil?: boolean
  accessPurchasing?: boolean
  accessIt?: boolean
  accessDana?: boolean
  accessMobil?: boolean
  role?: RoleForSession | null
}): SessionAuthUser {
  const normalizedLevel = normalizeUserLevel(user.level)
  const roleCaps = user.role
    ? capabilitiesFromRole(user.role)
    : capabilitiesFromLevel(user.level)
  const capabilities = applyUserModules(
    roleCaps,
    {
      managePurchasing: Boolean(user.managePurchasing),
      manageIt: Boolean(user.manageIt),
      manageDana: Boolean(user.manageDana),
      manageMobil: Boolean(user.manageMobil),
    },
    {
      accessPurchasing: Boolean(user.accessPurchasing),
      accessIt: Boolean(user.accessIt),
      accessDana: Boolean(user.accessDana),
      accessMobil: Boolean(user.accessMobil),
    }
  )

  return {
    id: String(user.idUser),
    username: user.username,
    jabatan: user.jabatan,
    level: user.role?.code ?? user.level,
    roleName: user.role?.name ?? USER_LEVEL_LABEL[normalizedLevel],
    homePath: homePathFromCapabilities(capabilities),
    capabilities,
  }
}

export function sessionUserFromToken(token: {
  sub?: string
  username?: string
  jabatan?: string
  level?: string
  roleName?: string
  homePath?: string
  capabilities?: RoleCapabilities
}): SessionAuthUser {
  const level = token.level || "user"
  const normalizedLevel = normalizeUserLevel(level)
  const capabilities = hydrateCapabilities(token.capabilities, level)
  return {
    id: token.sub || "",
    username: token.username || "",
    jabatan: token.jabatan || "",
    level,
    roleName: token.roleName || USER_LEVEL_LABEL[normalizedLevel],
    homePath:
      token.homePath ||
      homePathFromCapabilities(capabilities) ||
      SYSTEM_ROLE_HOME_PATH[normalizedLevel],
    capabilities,
  }
}
