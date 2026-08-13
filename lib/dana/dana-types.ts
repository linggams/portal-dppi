export type DanaPengajuan = {
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
  tglDisetujui: string | null
  tglDibuat: string
  tglDiupdate: string
}

export type DanaPengajuanPayload = {
  nominal: number
  keperluan: string
}
