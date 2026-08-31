-- Step 1: legacy it -> admin (sebelum enum di-rename)
-- Step 2: jalankan rename_admin_to_administrator.sql
-- Run step 1: pnpm prisma db execute --file prisma/migrations/migrate_it_to_administrator.sql

UPDATE "user" SET level = 'admin'::"UserLevel"
WHERE level::text = 'it';
