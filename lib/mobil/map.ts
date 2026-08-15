import { pemakaianKm, type MobilLaporanKm, type MobilKendaraan } from "./mobil-types"

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

export function toMobilLaporan(row: {
  idLaporan: number
  idKendaraan: number
  username: string
  jabatan: string
  tanggal: Date
  kmAwal: number
  kmAkhir: number
  keterangan: string
  buktiPath: string
  tglDibuat: Date
  tglDiupdate: Date
  kendaraan?: {
    idKendaraan: number
    nopol: string
    jenis?: { nama: string } | null
  } | null
}): MobilLaporanKm {
  return {
    idLaporan: row.idLaporan,
    idKendaraan: row.idKendaraan,
    username: row.username,
    jabatan: row.jabatan,
    tanggal: row.tanggal.toISOString().slice(0, 10),
    kmAwal: row.kmAwal,
    kmAkhir: row.kmAkhir,
    pemakaian: pemakaianKm(row.kmAwal, row.kmAkhir),
    keterangan: row.keterangan,
    buktiPath: row.buktiPath,
    tglDibuat: row.tglDibuat.toISOString(),
    tglDiupdate: row.tglDiupdate.toISOString(),
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
