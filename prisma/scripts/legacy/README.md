# Legacy SQL scripts

Skrip SQL one-off / migrasi manual (bukan Prisma Migrate).

Jalankan contoh:

```bash
npx prisma db execute --file prisma/scripts/legacy/rename_tables_atk_prefix.sql
```

Folder `prisma/migrations/` hanya untuk migrasi ber-folder Prisma (`migration.sql` + `migration_lock.toml`).
