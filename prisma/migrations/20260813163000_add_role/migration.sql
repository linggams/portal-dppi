-- Tambah master role dan tautkan user.id_role.
-- Tidak ada DELETE: semua baris user tetap ada; role lama hanya di-backfill.

CREATE TABLE IF NOT EXISTS "role" (
  id_role SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  is_system BOOLEAN NOT NULL DEFAULT false,
  home_path VARCHAR(100) NOT NULL,
  can_access_platform BOOLEAN NOT NULL DEFAULT false,
  can_access_purchasing_user BOOLEAN NOT NULL DEFAULT false,
  can_handle_purchasing_workflow BOOLEAN NOT NULL DEFAULT false,
  can_manage_purchasing_master BOOLEAN NOT NULL DEFAULT false,
  can_access_it_user BOOLEAN NOT NULL DEFAULT false,
  can_access_it_staff BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO "role" (
  code, name, description, is_system, home_path,
  can_access_platform, can_access_purchasing_user,
  can_handle_purchasing_workflow, can_manage_purchasing_master,
  can_access_it_user, can_access_it_staff
) VALUES
  (
    'administrator', 'Pengelola', 'Akses penuh: kelola user, stok, approve, dan tiket IT',
    true, '/platform/dashboard',
    true, true, true, true, true, true
  ),
  (
    'user', 'Pemohon', 'Ajukan permintaan ATK dan tiket gangguan',
    true, '/purchasing/user/dashboard',
    false, true, false, false, true, false
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system,
  home_path = EXCLUDED.home_path,
  can_access_platform = EXCLUDED.can_access_platform,
  can_access_purchasing_user = EXCLUDED.can_access_purchasing_user,
  can_handle_purchasing_workflow = EXCLUDED.can_handle_purchasing_workflow,
  can_manage_purchasing_master = EXCLUDED.can_manage_purchasing_master,
  can_access_it_user = EXCLUDED.can_access_it_user,
  can_access_it_staff = EXCLUDED.can_access_it_staff;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS id_role INTEGER;

UPDATE "user" AS u
SET id_role = r.id_role
FROM "role" AS r
WHERE u.id_role IS NULL
  AND r.code = u.level::text;

UPDATE "user"
SET id_role = (SELECT id_role FROM "role" WHERE code = 'administrator')
WHERE id_role IS NULL
  AND level::text IN ('administrator', 'admin', 'bendahara', 'purchasing', 'it_support', 'it');

UPDATE "user"
SET id_role = (SELECT id_role FROM "role" WHERE code = 'user')
WHERE id_role IS NULL;

ALTER TABLE "user" ALTER COLUMN id_role SET NOT NULL;

ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_id_role_fkey;
ALTER TABLE "user" ADD CONSTRAINT user_id_role_fkey
  FOREIGN KEY (id_role) REFERENCES "role"(id_role) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS user_id_role_idx ON "user"(id_role);
