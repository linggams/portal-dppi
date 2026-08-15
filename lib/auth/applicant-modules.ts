import type { ApplicantModules } from "@/lib/auth/capabilities"

export type { ApplicantModules }

export const EMPTY_APPLICANT_MODULES: ApplicantModules = {
  accessPurchasing: false,
  accessIt: false,
  accessDana: false,
  accessMobil: false,
}

export const ALL_APPLICANT_MODULES: ApplicantModules = {
  accessPurchasing: true,
  accessIt: true,
  accessDana: true,
  accessMobil: true,
}

export const APPLICANT_MODULE_OPTIONS = [
  {
    key: "accessPurchasing" as const,
    label: "Purchasing",
    description: "Permintaan ATK, lihat stok",
  },
  {
    key: "accessIt" as const,
    label: "IT Support",
    description: "Buat tiket, antrian gangguan",
  },
  {
    key: "accessDana" as const,
    label: "Pengajuan Dana",
    description: "Ajukan & cetak pengajuan dana",
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
    modules.accessIt ||
    modules.accessDana ||
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
    accessIt: Boolean(modules?.accessIt),
    accessDana: Boolean(modules?.accessDana),
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
