-- Migration: Convert atk_jenis_barang.id_jenis from VARCHAR to INTEGER
-- Run: npx prisma db execute --file prisma/migrations/fix_jenis_barang_id.sql
-- Note: If tables are not yet renamed, run rename_tables_atk_prefix.sql first,
-- or replace atk_* with legacy names below.

ALTER TABLE "atk_jenis_barang"
  ALTER COLUMN "id_jenis" TYPE INTEGER USING ("id_jenis"::integer);

ALTER TABLE "atk_stokbarang"
  ADD CONSTRAINT "atk_stokbarang_id_jenis_fkey"
  FOREIGN KEY ("id_jenis") REFERENCES "atk_jenis_barang"("id_jenis")
  ON DELETE RESTRICT ON UPDATE CASCADE;
