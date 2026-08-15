-- Modul penggunaan mobil + flag manage_mobil untuk pengelola

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "manage_mobil" BOOLEAN NOT NULL DEFAULT false;

UPDATE "user"
SET "manage_mobil" = true
WHERE "level" = 'administrator' OR "id_role" IN (
  SELECT id_role FROM "role" WHERE code = 'administrator'
);

CREATE TABLE IF NOT EXISTS "mobil_jenis" (
  "id_jenis" SERIAL PRIMARY KEY,
  "nama" VARCHAR(100) NOT NULL,
  "keterangan" VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "mobil_plot" (
  "id_plot" SERIAL PRIMARY KEY,
  "nama" VARCHAR(100) NOT NULL,
  "lokasi" VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS "mobil_kendaraan" (
  "id_kendaraan" SERIAL PRIMARY KEY,
  "nopol" VARCHAR(20) NOT NULL,
  "id_jenis" INTEGER NOT NULL,
  "id_plot" INTEGER NOT NULL,
  "km_awal" INTEGER NOT NULL DEFAULT 0,
  "aktif" BOOLEAN NOT NULL DEFAULT true,
  "tgl_dibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tgl_diupdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mobil_kendaraan_nopol_key" UNIQUE ("nopol"),
  CONSTRAINT "mobil_kendaraan_id_jenis_fkey"
    FOREIGN KEY ("id_jenis") REFERENCES "mobil_jenis"("id_jenis") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "mobil_kendaraan_id_plot_fkey"
    FOREIGN KEY ("id_plot") REFERENCES "mobil_plot"("id_plot") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "mobil_kendaraan_id_jenis_idx" ON "mobil_kendaraan"("id_jenis");
CREATE INDEX IF NOT EXISTS "mobil_kendaraan_id_plot_idx" ON "mobil_kendaraan"("id_plot");
CREATE INDEX IF NOT EXISTS "mobil_kendaraan_aktif_idx" ON "mobil_kendaraan"("aktif");

CREATE TABLE IF NOT EXISTS "mobil_laporan_km" (
  "id_laporan" SERIAL PRIMARY KEY,
  "id_kendaraan" INTEGER NOT NULL,
  "username" VARCHAR(20) NOT NULL,
  "jabatan" VARCHAR(50) NOT NULL,
  "tanggal" DATE NOT NULL,
  "km_awal" INTEGER NOT NULL,
  "km_akhir" INTEGER NOT NULL,
  "keterangan" TEXT NOT NULL DEFAULT '',
  "bukti_path" VARCHAR(255) NOT NULL,
  "tgl_dibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tgl_diupdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mobil_laporan_km_id_kendaraan_tanggal_key" UNIQUE ("id_kendaraan", "tanggal"),
  CONSTRAINT "mobil_laporan_km_id_kendaraan_fkey"
    FOREIGN KEY ("id_kendaraan") REFERENCES "mobil_kendaraan"("id_kendaraan") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "mobil_laporan_km_username_idx" ON "mobil_laporan_km"("username");
CREATE INDEX IF NOT EXISTS "mobil_laporan_km_tanggal_idx" ON "mobil_laporan_km"("tanggal");
CREATE INDEX IF NOT EXISTS "mobil_laporan_km_id_kendaraan_idx" ON "mobil_laporan_km"("id_kendaraan");
