-- Rename enum value admin -> administrator
-- Run: pnpm prisma db execute --file prisma/migrations/rename_admin_to_administrator.sql

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserLevel' AND e.enumlabel = 'admin'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'UserLevel' AND e.enumlabel = 'administrator'
  ) THEN
    ALTER TYPE "UserLevel" RENAME VALUE 'admin' TO 'administrator';
  END IF;
END $$;
