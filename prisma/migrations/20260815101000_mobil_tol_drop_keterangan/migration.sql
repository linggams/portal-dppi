-- Hapus kolom keterangan yang tidak dipakai; tambah tol (IDR) per perjalanan.

ALTER TABLE "mobil_laporan_km" DROP COLUMN IF EXISTS "keterangan";

ALTER TABLE "mobil_laporan_perjalanan"
  ADD COLUMN IF NOT EXISTS "tol" INTEGER NOT NULL DEFAULT 0;
