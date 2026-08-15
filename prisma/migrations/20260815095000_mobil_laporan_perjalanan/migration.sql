-- Multi-perjalanan: foto pindah ke detail trip.

CREATE TABLE IF NOT EXISTS "mobil_laporan_perjalanan" (
  "id_perjalanan" SERIAL PRIMARY KEY,
  "id_laporan" INTEGER NOT NULL,
  "urutan" INTEGER NOT NULL,
  "dari" VARCHAR(100) NOT NULL,
  "ke" VARCHAR(100) NOT NULL,
  "km" INTEGER NOT NULL,
  "bukti_path" VARCHAR(255) NOT NULL,
  CONSTRAINT "mobil_laporan_perjalanan_id_laporan_fkey"
    FOREIGN KEY ("id_laporan") REFERENCES "mobil_laporan_km"("id_laporan")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "mobil_laporan_perjalanan_id_laporan_urutan_key"
  ON "mobil_laporan_perjalanan"("id_laporan", "urutan");

CREATE INDEX IF NOT EXISTS "mobil_laporan_perjalanan_id_laporan_idx"
  ON "mobil_laporan_perjalanan"("id_laporan");

-- Migrate existing header bukti into a single trip row.
INSERT INTO "mobil_laporan_perjalanan" ("id_laporan", "urutan", "dari", "ke", "km", "bukti_path")
SELECT
  l."id_laporan",
  1,
  '-',
  '-',
  GREATEST(l."km_akhir" - l."km_awal", 0),
  l."bukti_path"
FROM "mobil_laporan_km" l
WHERE NOT EXISTS (
  SELECT 1 FROM "mobil_laporan_perjalanan" p WHERE p."id_laporan" = l."id_laporan"
)
AND EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'mobil_laporan_km' AND column_name = 'bukti_path'
);

ALTER TABLE "mobil_laporan_km" DROP COLUMN IF EXISTS "bukti_path";
