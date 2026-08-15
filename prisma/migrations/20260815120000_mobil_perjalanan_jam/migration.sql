-- Jam keberangkatan / tiba per perjalanan (HH:mm).

ALTER TABLE "mobil_laporan_perjalanan"
  ADD COLUMN IF NOT EXISTS "jam_dari" VARCHAR(5) NOT NULL DEFAULT '00:00',
  ADD COLUMN IF NOT EXISTS "jam_ke" VARCHAR(5) NOT NULL DEFAULT '00:00';
