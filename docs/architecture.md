# Portal Support — Struktur Aplikasi

## Domain

| Domain | Route UI | API | DB prefix |
|--------|----------|-----|-----------|
| Purchasing | `/purchasing/admin/*`, `/purchasing/user/*` | `/api/purchasing/*` | `atk_*` |
| IT Support | `/it/staff/*`, `/it/user/*` | `/api/it/*` | `it_*` |
| Platform | `/platform/*` | `/api/platform/*` | `user` |

## Role & akses

- `administrator` → Semua: Purchasing admin penuh, IT staff, Platform users
- `purchasing` → Purchasing operasional (permintaan/pengajuan, approve) — bukan stok/kategori/laporan/platform
- `user` → Client Purchasing (`/purchasing/user/*`) + tiket gangguan (`/it/user/*`)
- `it_support` → IT staff saja (`/it/staff/*`)

Permission terpusat: `lib/auth/permissions.ts`

## Redirect legacy

URL lama (`/admin/*`, `/user/*`, `/it/dashboard`, dll.) di-redirect otomatis via `middleware.ts`.
