import type {
  PermintaanGroupRow,
  PermintaanGroupsSummary,
} from "@/lib/purchasing/permintaan-group-types"

export type { PermintaanGroupRow, PermintaanGroupsSummary }

export interface PermintaanGroupFilters {
  startDate: string
  endDate: string
  status: string
  unit: string
}
