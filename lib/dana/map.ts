import type { DanaPengajuan } from "./dana-types"

export type DanaRow = {
  idPengajuan: number
  nomor: string
  username: string
  jabatan: string
  nominal: number
  kembalian: number
  keperluan: string
  status: number
  alasanTolak: string | null
  disetujuiOleh: string | null
  tglDisetujui: Date | null
  tglDibuat: Date
  tglDiupdate: Date
}

export function toDanaPengajuan(row: DanaRow): DanaPengajuan {
  return {
    idPengajuan: row.idPengajuan,
    nomor: row.nomor,
    username: row.username,
    jabatan: row.jabatan,
    nominal: row.nominal,
    kembalian: row.kembalian ?? 0,
    keperluan: row.keperluan,
    status: row.status,
    alasanTolak: row.alasanTolak,
    disetujuiOleh: row.disetujuiOleh,
    tglDisetujui: row.tglDisetujui?.toISOString() ?? null,
    tglDibuat: row.tglDibuat.toISOString(),
    tglDiupdate: row.tglDiupdate.toISOString(),
  }
}
