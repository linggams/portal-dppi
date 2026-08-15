import type { ApplicantModules } from "@/lib/auth/applicant-modules"
import type { ManagerModules } from "@/lib/auth/manager-modules"

export interface UserRole {
  idRole: number
  code: string
  name: string
}

export interface User {
  idUser: number
  username: string
  jabatan: string
  roleId: number
  level?: string
  managePurchasing: boolean
  manageIt: boolean
  manageDana: boolean
  manageMobil: boolean
  accessPurchasing: boolean
  accessIt: boolean
  accessDana: boolean
  accessMobil: boolean
  role: UserRole | null
}

export interface UserFormData {
  username: string
  password: string
  roleId: number | ""
  jabatan: string
  modules: ManagerModules
  accessModules: ApplicantModules
}
