-- Carry legacy IT Support module flags over to ITMS before dropping them
UPDATE "user"
SET "manage_itms" = TRUE
WHERE "manage_it" = TRUE AND "manage_itms" = FALSE;

UPDATE "user"
SET "access_itms" = TRUE
WHERE "access_it" = TRUE AND "access_itms" = FALSE;

-- Drop legacy IT Support tables (FK order)
DROP TABLE IF EXISTS "it_maintenance_log" CASCADE;
DROP TABLE IF EXISTS "it_tiket_komentar" CASCADE;
DROP TABLE IF EXISTS "it_tiket" CASCADE;
DROP TABLE IF EXISTS "it_tiket_kategori" CASCADE;

-- Drop legacy user/role flags
ALTER TABLE "user" DROP COLUMN IF EXISTS "manage_it";
ALTER TABLE "user" DROP COLUMN IF EXISTS "access_it";
ALTER TABLE "role" DROP COLUMN IF EXISTS "can_access_it_user";
ALTER TABLE "role" DROP COLUMN IF EXISTS "can_access_it_staff";
