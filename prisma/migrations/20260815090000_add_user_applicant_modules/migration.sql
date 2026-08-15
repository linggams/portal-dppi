-- Per-user module access for Pemohon. Additive only.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS access_purchasing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_it BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_dana BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_mobil BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing pemohon: keep previous blanket user access.
UPDATE "user" AS u
SET
  access_purchasing = true,
  access_it = true,
  access_dana = true,
  access_mobil = true
FROM role AS r
WHERE u.id_role = r.id_role
  AND r.can_access_platform = false;
