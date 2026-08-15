-- Hapus master Plot dari modul mobil

DROP INDEX IF EXISTS "mobil_kendaraan_id_plot_idx";

ALTER TABLE "mobil_kendaraan" DROP CONSTRAINT IF EXISTS "mobil_kendaraan_id_plot_fkey";
ALTER TABLE "mobil_kendaraan" DROP COLUMN IF EXISTS "id_plot";

DROP TABLE IF EXISTS "mobil_plot";
