import type { RoleCapabilities } from "@/lib/auth/capabilities"

export interface RoleListItem {
  idRole: number
  name: string
  description: string
  capabilities: RoleCapabilities
}
