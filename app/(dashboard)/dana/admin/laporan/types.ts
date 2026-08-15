import type {
  DanaLaporanByJabatan,
  DanaLaporanRow,
  DanaLaporanSummary,
  DanaLaporanTab,
} from "@/lib/dana/laporan"

export type {
  DanaLaporanByJabatan,
  DanaLaporanRow,
  DanaLaporanSummary,
  DanaLaporanTab,
}

export type DanaLaporanFilterState = {
  startDate: string
  endDate: string
  status: string
  q: string
  jabatan: string
}
