import type { ItLaporanSummary, ItLaporanTab } from "@/lib/it/laporan"

export type { ItLaporanSummary, ItLaporanTab }

export interface ItLaporanFilters {
  startDate: string
  endDate: string
  status: string
  prioritas: string
  kategoriId: string
  username: string
  ditugaskanKe: string
  dateField: "dibuat" | "selesai"
}

export interface TiketLaporanItem {
  idTiket: number
  nomorTiket: string
  judul: string
  username: string
  jabatan: string
  prioritas: string
  status: number
  ditugaskanKe: string | null
  tglDibuat: string
  tglSelesai: string | null
  kategori: { idKategori: number; nama: string }
}

export interface KategoriLaporanItem {
  idKategori: number
  kategoriNama: string
  total: number
  dalamAntrian: number
  selesai: number
  rataRataJamSelesai: number | null
}

export interface TeknisiLaporanItem {
  ditugaskanKe: string
  total: number
  dalamAntrian: number
  selesai: number
  rataRataJamSelesai: number | null
}
