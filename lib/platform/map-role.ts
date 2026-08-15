import {
  capabilitiesFromRole,
  type RoleCapabilityFields,
} from "@/lib/auth/capabilities"
import type { RoleListItem } from "@/lib/platform/role-types"

export function toRoleListItem(
  role: RoleCapabilityFields & {
    idRole: number
    name: string
    description: string
  }
): RoleListItem {
  return {
    idRole: role.idRole,
    name: role.name,
    description: role.description,
    capabilities: capabilitiesFromRole(role),
  }
}
