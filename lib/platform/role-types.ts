import type { RoleCapabilities } from "@/lib/auth/capabilities"

export const ROLE_HOME_PATH_OPTIONS = [
  { value: "/platform/dashboard", label: "Dashboard Platform" },
  { value: "/purchasing/user/dashboard", label: "Dashboard User Purchasing" },
  { value: "/it/user/antrian", label: "Antrian Tiket IT" },
] as const

export type RoleHomePath = (typeof ROLE_HOME_PATH_OPTIONS)[number]["value"]

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

export interface RoleFormData {
  name: string
  code: string
  description: string
  homePath: string
  capabilities: RoleCapabilities
}

export function slugifyRoleCode(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50)
}

export function describeRoleCapabilities(caps: RoleCapabilities): string {
  const labels: string[] = []
  if (caps.platform) labels.push("Platform")
  if (caps.purchasingMaster) labels.push("ATK master")
  else if (caps.purchasingWorkflow) labels.push("ATK operasional")
  if (caps.purchasingUser) labels.push("ATK user")
  if (caps.itStaff) labels.push("IT staff")
  if (caps.itUser) labels.push("IT user")
  if (caps.danaWorkflow) labels.push("Dana")
  return labels.join(", ") || "—"
}

export function hasAnyCapability(caps: RoleCapabilities): boolean {
  return Object.values(caps).some(Boolean)
}

export function normalizeRoleCapabilities(
  caps: RoleCapabilities
): RoleCapabilities {
  return {
    ...caps,
    purchasingWorkflow: caps.purchasingWorkflow || caps.purchasingMaster,
  }
}
