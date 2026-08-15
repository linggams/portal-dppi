import {
  pemakaianKm,
  type MobilLaporanKm,
  type MobilLaporanPerjalanan,
  type MobilKendaraan,
} from "./mobil-types"

export function toMobilKendaraan(row: {
  idKendaraan: number
  nopol: string
  idJenis: number
  kmAwal: number
  aktif: boolean
  tglDibuat: Date
  tglDiupdate: Date
  jenis?: { idJenis: number; nama: string } | null
  laporan?: { kmAkhir: number }[]
}): MobilKendaraan {
  const last = row.laporan?.[0]?.kmAkhir
  return {
    idKendaraan: row.idKendaraan,
    nopol: row.nopol,
    idJenis: row.idJenis,
    kmAwal: row.kmAwal,
    aktif: row.aktif,
    tglDibuat: row.tglDibuat.toISOString(),
    tglDiupdate: row.tglDiupdate.toISOString(),
    jenis: row.jenis ?? undefined,
    kmTerakhir: last ?? row.kmAwal,
  }
}

function toPerjalanan(row: {
  idPerjalanan: number
  idLaporan: number
  urutan: number
  dari: string
  jamDari: string
  ke: string
  jamKe: string
  km: number
  tol: number
  buktiPath: string | null
}): MobilLaporanPerjalanan {
  return {
    idPerjalanan: row.idPerjalanan,
    idLaporan: row.idLaporan,
    urutan: row.urutan,
    dari: row.dari,
    jamDari: row.jamDari,
    ke: row.ke,
    jamKe: row.jamKe,
    km: row.km,
    tol: row.tol,
    buktiPath: row.buktiPath,
  }
}

export function toMobilLaporan(row: {
  idLaporan: number
  idKendaraan: number
  username: string
  jabatan: string
  tanggal: Date
  kmAwal: number
  kmAkhir: number
  tglDibuat: Date
  tglDiupdate: Date
  perjalanan?: Array<{
    idPerjalanan: number
    idLaporan: number
    urutan: number
    dari: string
    jamDari: string
    ke: string
    jamKe: string
    km: number
    tol: number
    buktiPath: string | null
  }>
  kendaraan?: {
    idKendaraan: number
    nopol: string
    jenis?: { nama: string } | null
  } | null
}): MobilLaporanKm {
  const perjalanan = (row.perjalanan ?? [])
    .slice()
    .sort((a, b) => a.urutan - b.urutan)
    .map(toPerjalanan)

  return {
    idLaporan: row.idLaporan,
    idKendaraan: row.idKendaraan,
    username: row.username,
    jabatan: row.jabatan,
    tanggal: row.tanggal.toISOString().slice(0, 10),
    kmAwal: row.kmAwal,
    kmAkhir: row.kmAkhir,
    pemakaian: pemakaianKm(row.kmAwal, row.kmAkhir),
    jumlahPerjalanan: perjalanan.length,
    totalTol: perjalanan.reduce((sum, trip) => sum + trip.tol, 0),
    tglDibuat: row.tglDibuat.toISOString(),
    tglDiupdate: row.tglDiupdate.toISOString(),
    perjalanan,
    kendaraan: row.kendaraan
      ? {
          idKendaraan: row.kendaraan.idKendaraan,
          nopol: row.kendaraan.nopol,
          jenis: row.kendaraan.jenis ?? undefined,
        }
      : undefined,
  }
}

export function parseDateOnly(value: string) {
  const d = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return null
  return d
}
