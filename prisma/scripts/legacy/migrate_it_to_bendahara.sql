-- Deprecated: gunakan migrate_it_to_administrator.sql lalu rename_admin_to_administrator.sql
UPDATE "user" SET level = 'admin'::"UserLevel" WHERE level::text = 'it';
