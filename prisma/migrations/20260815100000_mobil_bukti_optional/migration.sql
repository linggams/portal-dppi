-- Bukti foto perjalanan bersifat opsional.
ALTER TABLE "mobil_laporan_perjalanan"
  ALTER COLUMN "bukti_path" DROP NOT NULL;
