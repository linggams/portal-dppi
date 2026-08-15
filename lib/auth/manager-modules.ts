import type { ManagerModules } from "@/lib/auth/capabilities"

export type { ManagerModules }

export const EMPTY_MANAGER_MODULES: ManagerModules = {
  managePurchasing: false,
  manageIt: false,
  manageDana: false,
  manageMobil: false,
}

export const ALL_MANAGER_MODULES: ManagerModules = {
  managePurchasing: true,
  manageIt: true,
  manageDana: true,
  manageMobil: true,
}

export const MANAGER_MODULE_OPTIONS = [
  {
    key: "managePurchasing" as const,
    label: "Purchasing",
    description: "Antrian, stok, approve ATK",
  },
  {
    key: "manageIt" as const,
    label: "IT Support",
    description: "Antrian tiket, maintenance",
  },
  {
    key: "manageDana" as const,
    label: "Pengajuan Dana",
    description: "Antrian, setujui / tolak dana",
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
    modules.manageIt ||
    modules.manageDana ||
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
    manageIt: Boolean(modules?.manageIt),
    manageDana: Boolean(modules?.manageDana),
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
    return { ok: false, error: "Pilih minimal satu modul" }
  }
  return { ok: true, modules }
}
