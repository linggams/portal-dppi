import type { RoleCapabilities } from "@/lib/auth/capabilities"

export interface RoleListItem {
  idRole: number
  code: string
  name: string
  description: string
  isSystem: boolean
  homePath: string
  userCount: number
  capabilities: RoleCapabilities
}
