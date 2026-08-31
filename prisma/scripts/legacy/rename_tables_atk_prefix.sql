-- Rename application tables to atk_* prefix (idempotent)
-- Run: npx prisma db execute --file prisma/migrations/rename_tables_atk_prefix.sql

-- Tabel user tetap "user" (tanpa prefix atk_)
DO $$
BEGIN
  IF to_regclass('public.jenis_barang') IS NOT NULL AND to_regclass('public.atk_jenis_barang') IS NULL THEN
    ALTER TABLE "jenis_barang" RENAME TO "atk_jenis_barang";
  END IF;

  IF to_regclass('public.stokbarang') IS NOT NULL AND to_regclass('public.atk_stokbarang') IS NULL THEN
    ALTER TABLE "stokbarang" RENAME TO "atk_stokbarang";
  END IF;

  IF to_regclass('public.permintaan') IS NOT NULL AND to_regclass('public.atk_permintaan') IS NULL THEN
    ALTER TABLE "permintaan" RENAME TO "atk_permintaan";
  END IF;

  IF to_regclass('public.sementara') IS NOT NULL AND to_regclass('public.atk_sementara') IS NULL THEN
    ALTER TABLE "sementara" RENAME TO "atk_sementara";
  END IF;

  IF to_regclass('public.pengajuan') IS NOT NULL AND to_regclass('public.atk_pengajuan') IS NULL THEN
    ALTER TABLE "pengajuan" RENAME TO "atk_pengajuan";
  END IF;

  IF to_regclass('public.pengajuan_sementara') IS NOT NULL AND to_regclass('public.atk_pengajuan_sementara') IS NULL THEN
    ALTER TABLE "pengajuan_sementara" RENAME TO "atk_pengajuan_sementara";
  END IF;

  IF to_regclass('public.pemasukan') IS NOT NULL AND to_regclass('public.atk_pemasukan') IS NULL THEN
    ALTER TABLE "pemasukan" RENAME TO "atk_pemasukan";
  END IF;

  IF to_regclass('public.pengeluaran') IS NOT NULL AND to_regclass('public.atk_pengeluaran') IS NULL THEN
    ALTER TABLE "pengeluaran" RENAME TO "atk_pengeluaran";
  END IF;
END $$;
