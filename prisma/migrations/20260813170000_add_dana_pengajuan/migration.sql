-- Modul Pengajuan Dana. Additive only: tidak ada DELETE.

CREATE TABLE IF NOT EXISTS "dana_pengajuan" (
  id_pengajuan SERIAL PRIMARY KEY,
  nomor VARCHAR(20) NOT NULL UNIQUE,
  username VARCHAR(20) NOT NULL,
  jabatan VARCHAR(50) NOT NULL,
  nominal INTEGER NOT NULL,
  keperluan TEXT NOT NULL,
  status INTEGER NOT NULL DEFAULT 0,
  alasan_tolak TEXT,
  disetujui_oleh VARCHAR(20),
  tgl_disetujui TIMESTAMP(3),
  tgl_dibuat TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tgl_diupdate TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS dana_pengajuan_username_idx ON "dana_pengajuan"(username);
CREATE INDEX IF NOT EXISTS dana_pengajuan_status_idx ON "dana_pengajuan"(status);
CREATE INDEX IF NOT EXISTS dana_pengajuan_tgl_dibuat_idx ON "dana_pengajuan"(tgl_dibuat);
