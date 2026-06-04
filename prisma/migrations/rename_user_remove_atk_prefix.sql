-- Kembalikan atk_user -> user (tabel user tanpa prefix atk_)
-- Run: pnpm prisma db execute --file prisma/migrations/rename_user_remove_atk_prefix.sql

DO $$
BEGIN
  IF to_regclass('public.atk_user') IS NOT NULL AND to_regclass('public.user') IS NULL THEN
    ALTER TABLE "atk_user" RENAME TO "user";
  END IF;
END $$;
