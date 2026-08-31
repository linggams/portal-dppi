-- Rename columns instansi -> user to match Prisma schema
-- Supports atk_* table names (after rename_tables_atk_prefix.sql)
-- Run: pnpm prisma db execute --file prisma/migrations/rename_instansi_columns.sql

DO $$
DECLARE
  permintaan_table text;
  sementara_table text;
BEGIN
  IF to_regclass('public.atk_permintaan') IS NOT NULL THEN
    permintaan_table := 'atk_permintaan';
  ELSIF to_regclass('public.permintaan') IS NOT NULL THEN
    permintaan_table := 'permintaan';
  END IF;

  IF to_regclass('public.atk_sementara') IS NOT NULL THEN
    sementara_table := 'atk_sementara';
  ELSIF to_regclass('public.sementara') IS NOT NULL THEN
    sementara_table := 'sementara';
  END IF;

  IF permintaan_table IS NOT NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = permintaan_table AND column_name = 'instansi'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = permintaan_table AND column_name = 'user'
  ) THEN
    EXECUTE format('ALTER TABLE %I RENAME COLUMN instansi TO "user"', permintaan_table);
  END IF;

  IF sementara_table IS NOT NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = sementara_table AND column_name = 'instansi'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = sementara_table AND column_name = 'user'
  ) THEN
    EXECUTE format('ALTER TABLE %I RENAME COLUMN instansi TO "user"', sementara_table);
  END IF;
END $$;
