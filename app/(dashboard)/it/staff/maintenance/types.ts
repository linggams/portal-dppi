import type {
  KategoriMaintenanceAgg,
  MaintenanceRow,
  MaintenanceSummary,
  MaintenanceTab,
  TeknisiMaintenanceAgg,
} from "@/lib/it/maintenance-shared"

export type { MaintenanceTab }

export interface MaintenanceFilters {
  startDate: string
  endDate: string
  kategoriId: string
  username: string
  sumber: string
  hasil: string
  q: string
}

export type MaintenanceListItem = MaintenanceRow
export type MaintenanceSummaryData = MaintenanceSummary
export type KategoriAggItem = KategoriMaintenanceAgg
export type TeknisiAggItem = TeknisiMaintenanceAgg
