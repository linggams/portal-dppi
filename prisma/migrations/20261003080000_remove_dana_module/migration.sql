-- Hapus modul pengajuan dana

DROP TABLE IF EXISTS "dana_pengajuan";

ALTER TABLE "user" DROP COLUMN IF EXISTS "manage_dana";
ALTER TABLE "user" DROP COLUMN IF EXISTS "access_dana";

UPDATE "role"
SET description = 'Akses penuh: kelola user, stok, approve, tiket IT, dan mobil'
WHERE code = 'administrator';

UPDATE "role"
SET description = 'Ajukan permintaan ATK, tiket gangguan, dan laporan KM mobil'
WHERE code = 'user';
