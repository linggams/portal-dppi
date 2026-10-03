-- Relasi transaksi ke user. Baris historis tanpa akun dibuat sebagai user arsip.

INSERT INTO "user" (
  username, password, level, jabatan, id_role,
  manage_purchasing, manage_it, manage_mobil,
  access_purchasing, access_it, access_mobil
)
SELECT
  v.username,
  '$2b$10$.izT8MGq84A2GO0W2Ty0Hu8ykV08d50P4zZ4R94rUp8ijW4E7wjFG',
  'user'::"UserLevel",
  v.jabatan,
  (SELECT id_role FROM role WHERE code = 'user'),
  false, false, false, false, false, false
FROM (
  VALUES
    ('Nisa', 'PPIC HBI'),
    ('Heni Sparepart', 'Sparepart')
) AS v(username, jabatan)
WHERE NOT EXISTS (
  SELECT 1 FROM "user" u WHERE trim(u.username) = v.username
);

-- Purchasing
ALTER TABLE atk_permintaan ADD COLUMN id_user INTEGER;
ALTER TABLE atk_sementara ADD COLUMN id_user INTEGER;
ALTER TABLE atk_pengajuan ADD COLUMN id_user INTEGER;
ALTER TABLE atk_pengajuan_sementara ADD COLUMN id_user INTEGER;
ALTER TABLE atk_pemasukan ADD COLUMN id_user INTEGER;
ALTER TABLE atk_pengeluaran ADD COLUMN id_user INTEGER;

UPDATE atk_permintaan p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);
UPDATE atk_sementara p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);
UPDATE atk_pengajuan p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);
UPDATE atk_pengajuan_sementara p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);
UPDATE atk_pemasukan p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);
UPDATE atk_pengeluaran p SET id_user = u.id_user FROM "user" u WHERE trim(p.unit) = trim(u.username);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM atk_permintaan WHERE id_user IS NULL
    UNION ALL SELECT 1 FROM atk_sementara WHERE id_user IS NULL
    UNION ALL SELECT 1 FROM atk_pengajuan WHERE id_user IS NULL
    UNION ALL SELECT 1 FROM atk_pengajuan_sementara WHERE id_user IS NULL
    UNION ALL SELECT 1 FROM atk_pemasukan WHERE id_user IS NULL
    UNION ALL SELECT 1 FROM atk_pengeluaran WHERE id_user IS NULL
  ) THEN
    RAISE EXCEPTION 'Ada transaksi purchasing tanpa user';
  END IF;
END $$;

ALTER TABLE atk_permintaan ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE atk_sementara ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE atk_pengajuan ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE atk_pengajuan_sementara ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE atk_pemasukan ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE atk_pengeluaran ALTER COLUMN id_user SET NOT NULL;

ALTER TABLE atk_permintaan
  ADD CONSTRAINT atk_permintaan_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE atk_sementara
  ADD CONSTRAINT atk_sementara_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE atk_pengajuan
  ADD CONSTRAINT atk_pengajuan_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE atk_pengajuan_sementara
  ADD CONSTRAINT atk_pengajuan_sementara_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE atk_pemasukan
  ADD CONSTRAINT atk_pemasukan_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE atk_pengeluaran
  ADD CONSTRAINT atk_pengeluaran_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;

DROP INDEX atk_permintaan_unit_tgl_permintaan_idx;
DROP INDEX atk_sementara_unit_tgl_permintaan_idx;
DROP INDEX atk_pengajuan_unit_tgl_pengajuan_idx;
DROP INDEX atk_pengajuan_sementara_unit_tgl_pengajuan_idx;
DROP INDEX atk_pemasukan_unit_idx;
DROP INDEX atk_pengeluaran_unit_idx;

CREATE INDEX atk_permintaan_id_user_tgl_permintaan_idx ON atk_permintaan (id_user, tgl_permintaan);
CREATE INDEX atk_sementara_id_user_tgl_permintaan_idx ON atk_sementara (id_user, tgl_permintaan);
CREATE INDEX atk_pengajuan_id_user_tgl_pengajuan_idx ON atk_pengajuan (id_user, tgl_pengajuan);
CREATE INDEX atk_pengajuan_sementara_id_user_tgl_pengajuan_idx ON atk_pengajuan_sementara (id_user, tgl_pengajuan);
CREATE INDEX atk_pemasukan_id_user_idx ON atk_pemasukan (id_user);
CREATE INDEX atk_pengeluaran_id_user_idx ON atk_pengeluaran (id_user);

ALTER TABLE atk_permintaan DROP COLUMN unit, DROP COLUMN "user", DROP COLUMN id_jenis;
ALTER TABLE atk_sementara DROP COLUMN unit, DROP COLUMN "user", DROP COLUMN id_jenis;
ALTER TABLE atk_pengajuan DROP COLUMN unit, DROP COLUMN id_jenis;
ALTER TABLE atk_pengajuan_sementara DROP COLUMN unit, DROP COLUMN id_jenis;
ALTER TABLE atk_pemasukan DROP COLUMN unit;
ALTER TABLE atk_pengeluaran DROP COLUMN unit;

-- IT
ALTER TABLE it_tiket ADD COLUMN id_pemohon INTEGER;
ALTER TABLE it_tiket ADD COLUMN id_petugas INTEGER;
ALTER TABLE it_tiket_komentar ADD COLUMN id_user INTEGER;
ALTER TABLE it_maintenance_log ADD COLUMN id_user INTEGER;

UPDATE it_tiket t SET id_pemohon = u.id_user FROM "user" u WHERE trim(t.username) = trim(u.username);
UPDATE it_tiket t
SET id_petugas = u.id_user
FROM "user" u
WHERE t.ditugaskan_ke IS NOT NULL
  AND trim(t.ditugaskan_ke) <> ''
  AND trim(t.ditugaskan_ke) = trim(u.username);
UPDATE it_tiket_komentar k SET id_user = u.id_user FROM "user" u WHERE trim(k.username) = trim(u.username);
UPDATE it_maintenance_log m SET id_user = u.id_user FROM "user" u WHERE trim(m.username) = trim(u.username);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM it_tiket WHERE id_pemohon IS NULL)
    OR EXISTS (SELECT 1 FROM it_tiket_komentar WHERE id_user IS NULL)
    OR EXISTS (SELECT 1 FROM it_maintenance_log WHERE id_user IS NULL)
    OR EXISTS (
      SELECT 1 FROM it_tiket
      WHERE ditugaskan_ke IS NOT NULL AND trim(ditugaskan_ke) <> '' AND id_petugas IS NULL
    ) THEN
    RAISE EXCEPTION 'Ada data IT tanpa user';
  END IF;
END $$;

ALTER TABLE it_tiket ALTER COLUMN id_pemohon SET NOT NULL;
ALTER TABLE it_tiket_komentar ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE it_maintenance_log ALTER COLUMN id_user SET NOT NULL;

ALTER TABLE it_tiket
  ADD CONSTRAINT it_tiket_id_pemohon_fkey FOREIGN KEY (id_pemohon) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE it_tiket
  ADD CONSTRAINT it_tiket_id_petugas_fkey FOREIGN KEY (id_petugas) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE it_tiket_komentar
  ADD CONSTRAINT it_tiket_komentar_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;
ALTER TABLE it_maintenance_log
  ADD CONSTRAINT it_maintenance_log_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;

DROP INDEX it_tiket_username_idx;
DROP INDEX it_tiket_ditugaskan_ke_idx;
DROP INDEX it_maintenance_log_username_idx;
CREATE INDEX it_tiket_id_pemohon_idx ON it_tiket (id_pemohon);
CREATE INDEX it_tiket_id_petugas_idx ON it_tiket (id_petugas);
CREATE INDEX it_maintenance_log_id_user_idx ON it_maintenance_log (id_user);

ALTER TABLE it_tiket DROP COLUMN username, DROP COLUMN jabatan, DROP COLUMN ditugaskan_ke;
ALTER TABLE it_tiket_komentar DROP COLUMN username;
ALTER TABLE it_maintenance_log DROP COLUMN username;

-- Mobil
ALTER TABLE mobil_laporan_km ADD COLUMN id_user INTEGER;
UPDATE mobil_laporan_km l SET id_user = u.id_user FROM "user" u WHERE trim(l.username) = trim(u.username);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM mobil_laporan_km WHERE id_user IS NULL) THEN
    RAISE EXCEPTION 'Ada laporan mobil tanpa user';
  END IF;
END $$;

ALTER TABLE mobil_laporan_km ALTER COLUMN id_user SET NOT NULL;
ALTER TABLE mobil_laporan_km
  ADD CONSTRAINT mobil_laporan_km_id_user_fkey FOREIGN KEY (id_user) REFERENCES "user"(id_user) ON DELETE RESTRICT;

DROP INDEX mobil_laporan_km_username_idx;
CREATE INDEX mobil_laporan_km_id_user_idx ON mobil_laporan_km (id_user);
ALTER TABLE mobil_laporan_km DROP COLUMN username, DROP COLUMN jabatan;
