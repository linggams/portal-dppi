export interface Sementara {
  idSementara: number
  unit: string
  instansi: string
  kodeBrg: string
  idJenis: number
  jumlah: number
  tglPermintaan: string
  status: number
  stokbarang: {
    namaBrg: string
    satuan: string
    sisa: number
  }
}

export interface JenisBarang {
  idJenis: number
  jenisBrg: string
}

export interface StokBarang {
  idKodeBrg: number
  kodeBrg: string
  idJenis: number
  namaBrg: string
  hargabarang: string
  satuan: string
  sisa: number
}

export interface PermintaanFormData {
  idJenis: string
  kodeBrg: string
  jumlah: number
}
