import {
  capabilitiesFromRole,
  type RoleCapabilityFields,
} from "@/lib/auth/capabilities"
import type { RoleListItem } from "@/lib/platform/role-types"

export function toRoleListItem(role: RoleCapabilityFields & {
  idRole: number
  code: string
  name: string
  description: string
  isSystem: boolean
  homePath: string
  _count?: { users: number }
}): RoleListItem {
  return {
    idRole: role.idRole,
    code: role.code,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    homePath: role.homePath,
    userCount: role._count?.users ?? 0,
    capabilities: capabilitiesFromRole(role),
  }
}
