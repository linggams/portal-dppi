import type { ApplicantModules } from "@/lib/auth/capabilities"

export type { ApplicantModules }

export const EMPTY_APPLICANT_MODULES: ApplicantModules = {
  accessPurchasing: false,
  accessItms: false,
  accessMobil: false,
}

export const ALL_APPLICANT_MODULES: ApplicantModules = {
  accessPurchasing: true,
  accessItms: true,
  accessMobil: true,
}

export const APPLICANT_MODULE_OPTIONS = [
  {
    key: "accessPurchasing" as const,
    label: "Purchasing",
    description: "Permintaan ATK, lihat stok",
  },
  {
    key: "accessItms" as const,
    label: "IT Management",
    description: "Create tickets, my assets (SOP & NIST readable for all pemohon)",
  },
  {
    key: "accessMobil" as const,
    label: "Penggunaan Mobil",
    description: "Input laporan kilometer",
  },
] as const

export function hasAnyApplicantModule(modules: ApplicantModules) {
  return (
    modules.accessPurchasing ||
    modules.accessItms ||
    modules.accessMobil
  )
}

function resolveApplicantModules(
  isPemohon: boolean,
  modules?: Partial<ApplicantModules> | null
): ApplicantModules {
  if (!isPemohon) return EMPTY_APPLICANT_MODULES
  return {
    accessPurchasing: Boolean(modules?.accessPurchasing),
    accessItms: Boolean(modules?.accessItms),
    accessMobil: Boolean(modules?.accessMobil),
  }
}

export function applicantModulesForRole(
  isPemohon: boolean,
  input?: Partial<ApplicantModules> | null
): { ok: true; modules: ApplicantModules } | { ok: false; error: string } {
  if (!isPemohon) {
    return { ok: true, modules: EMPTY_APPLICANT_MODULES }
  }
  const modules = resolveApplicantModules(true, input ?? ALL_APPLICANT_MODULES)
  if (!hasAnyApplicantModule(modules)) {
    return { ok: false, error: "Pilih minimal satu modul" }
  }
  return { ok: true, modules }
}
