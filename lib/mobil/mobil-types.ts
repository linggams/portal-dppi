export type MobilJenis = {
  idJenis: number
  nama: string
  keterangan: string
}

export type MobilKendaraan = {
  idKendaraan: number
  nopol: string
  idJenis: number
  kmAwal: number
  aktif: boolean
  tglDibuat: string
  tglDiupdate: string
  jenis?: Pick<MobilJenis, "idJenis" | "nama">
  kmTerakhir?: number
}

export type MobilLaporanKm = {
  idLaporan: number
  idKendaraan: number
  username: string
  jabatan: string
  tanggal: string
  kmAwal: number
  kmAkhir: number
  pemakaian: number
  keterangan: string
  buktiPath: string
  tglDibuat: string
  tglDiupdate: string
  kendaraan?: {
    idKendaraan: number
    nopol: string
    jenis?: { nama: string }
  }
}

export function pemakaianKm(kmAwal: number, kmAkhir: number) {
  return Math.max(0, kmAkhir - kmAwal)
}
