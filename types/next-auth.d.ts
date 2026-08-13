import type { RoleCapabilities } from "@/lib/auth/capabilities"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      level: string
      jabatan: string
      roleName: string
      homePath: string
      capabilities: RoleCapabilities
    }
  }

  interface User {
    username: string
    level: string
    jabatan: string
    roleName: string
    homePath: string
    capabilities: RoleCapabilities
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    level: string
    jabatan: string
    roleName: string
    homePath: string
    capabilities: RoleCapabilities
  }
}
