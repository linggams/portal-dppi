import type { ManagerModules } from "@/lib/auth/capabilities"

export type { ManagerModules }

export const EMPTY_MANAGER_MODULES: ManagerModules = {
  managePurchasing: false,
  manageItms: false,
  manageMobil: false,
}

export const ALL_MANAGER_MODULES: ManagerModules = {
  managePurchasing: true,
  manageItms: true,
  manageMobil: true,
}

export const MANAGER_MODULE_OPTIONS = [
  {
    key: "managePurchasing" as const,
    label: "Purchasing",
    description: "Antrian, stok, approve ATK",
  },
  {
    key: "manageItms" as const,
    label: "IT Management",
    description: "IT Management console",
  },
  {
    key: "manageMobil" as const,
    label: "Penggunaan Mobil",
    description: "Jenis, kendaraan, laporan KM, input laporan",
  },
] as const

export function hasAnyManagerModule(modules: ManagerModules) {
  return (
    modules.managePurchasing ||
    modules.manageItms ||
    modules.manageMobil
  )
}

function resolveManagerModules(
  isPengelola: boolean,
  modules?: Partial<ManagerModules> | null
): ManagerModules {
  if (!isPengelola) return EMPTY_MANAGER_MODULES
  return {
    managePurchasing: Boolean(modules?.managePurchasing),
    manageItms: Boolean(modules?.manageItms),
    manageMobil: Boolean(modules?.manageMobil),
  }
}

export function managerModulesForRole(
  isPengelola: boolean,
  input?: Partial<ManagerModules> | null
): { ok: true; modules: ManagerModules } | { ok: false; error: string } {
  if (!isPengelola) {
    return { ok: true, modules: EMPTY_MANAGER_MODULES }
  }
  const modules = resolveManagerModules(true, input ?? ALL_MANAGER_MODULES)
  if (!hasAnyManagerModule(modules)) {
    return { ok: false, error: "Select at least one module" }
  }
  return { ok: true, modules }
}
