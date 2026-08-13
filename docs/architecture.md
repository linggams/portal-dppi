# Portal Support — Struktur Aplikasi

## Domain

| Domain | Route UI | API | DB prefix |
|--------|----------|-----|-----------|
| Purchasing | `/purchasing/admin/*`, `/purchasing/user/*` | `/api/purchasing/*` | `atk_*` |
| IT Support | `/it/staff/*`, `/it/user/*` | `/api/it/*` | `it_*` |
| Pengajuan Dana | `/dana/admin/*`, `/dana/user/*` | `/api/dana/*` | `dana_*` |
| Platform | `/platform/*` | `/api/platform/*` | `user`, `role` |

## Role & akses

Hanya dua role (label UI / kode DB):

- **Pemohon** (`user`) → portal pengajuan ATK (`/purchasing/user/*`) + tiket sendiri (`/it/user/*`) + pengajuan dana (`/dana/user/*`)
- **Pengelola** (`administrator`) → kelola user + dashboard; modul Purchasing / IT / Dana diatur per user (checkbox)

Permission terpusat: `lib/auth/permissions.ts` + `lib/auth/capabilities.ts`

Kolom `user.level` tetap diisi sebagai kompatibilitas (`user` / `administrator`).

## Redirect legacy

URL lama (`/admin/*`, `/user/*`, `/it/dashboard`, dll.) di-redirect otomatis via `middleware.ts`.
