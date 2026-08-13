-- Per-user module access for Pengelola. Additive only.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS manage_purchasing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manage_it BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manage_dana BOOLEAN NOT NULL DEFAULT false;

UPDATE "user" AS u
SET
  manage_purchasing = true,
  manage_it = true,
  manage_dana = true
FROM role AS r
WHERE u.id_role = r.id_role
  AND r.can_access_platform = true;
