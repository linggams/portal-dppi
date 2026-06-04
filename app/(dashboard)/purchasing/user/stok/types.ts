export interface StokBarang {
  idKodeBrg: number
  kodeBrg: string
  idJenis: number
  namaBrg: string
  hargabarang: string
  satuan: string
  stok: number
  keluar: number
  sisa: number
  keterangan: string
}

export interface JenisBarang {
  idJenis: number
  jenisBrg: string
}

