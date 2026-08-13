-- Kembalian pengajuan dana. Additive only.

ALTER TABLE "dana_pengajuan"
  ADD COLUMN IF NOT EXISTS kembalian INTEGER NOT NULL DEFAULT 0;
