-- Hapus kolom prioritas dari tiket gangguan IT
ALTER TABLE it_tiket DROP COLUMN IF EXISTS prioritas;
