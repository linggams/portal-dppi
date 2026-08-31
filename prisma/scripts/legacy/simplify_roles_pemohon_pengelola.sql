-- Sederhanakan role menjadi Pemohon (user) dan Pengelola (administrator).
UPDATE "role"
SET
  name = 'Pengelola',
  description = 'Akses penuh: kelola user, stok, approve, dan tiket IT',
  home_path = '/platform/dashboard',
  can_access_platform = true,
  can_access_purchasing_user = true,
  can_handle_purchasing_workflow = true,
  can_manage_purchasing_master = true,
  can_access_it_user = true,
  can_access_it_staff = true
WHERE code = 'administrator';

UPDATE "role"
SET
  name = 'Pemohon',
  description = 'Ajukan permintaan ATK dan tiket gangguan',
  home_path = '/purchasing/user/dashboard',
  can_access_platform = false,
  can_access_purchasing_user = true,
  can_handle_purchasing_workflow = false,
  can_manage_purchasing_master = false,
  can_access_it_user = true,
  can_access_it_staff = false
WHERE code = 'user';

UPDATE "user" AS u
SET
  id_role = admin_role.id_role,
  level = 'administrator'
FROM "role" AS admin_role
WHERE admin_role.code = 'administrator'
  AND (
    u.level::text IN ('purchasing', 'it_support', 'administrator', 'admin', 'bendahara')
    OR u.id_role IN (
      SELECT id_role FROM "role" WHERE code NOT IN ('user', 'administrator')
    )
  );

UPDATE "user" AS u
SET id_role = pemohon_role.id_role
FROM "role" AS pemohon_role
WHERE pemohon_role.code = 'user'
  AND u.level::text IN ('user', 'instansi');
