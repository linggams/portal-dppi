# Portal Support — Struktur Aplikasi

## Domain

| Domain | Route UI | API | DB prefix |
|--------|----------|-----|-----------|
| Purchasing | `/purchasing/admin/*`, `/purchasing/user/*` | `/api/purchasing/*` | `atk_*` |
| IT Support | `/it/staff/*`, `/it/user/*` | `/api/it/*` | `it_*` |
| Penggunaan Mobil | `/mobil/admin/*`, `/mobil/user/*` | `/api/mobil/*` | `mobil_*` |
| Platform | `/platform/*` | `/api/platform/*` | `user`, `role` |

## Role & akses

Hanya dua role (label UI / kode DB):

- **Pemohon** (`user`) → akses modul Purchasing / IT / Mobil diatur per user (checkbox); path `/purchasing/user/*`, `/it/user/*`, `/mobil/user/*`
- **Pengelola** (`administrator`) → kelola user + dashboard; modul Purchasing / IT / Mobil diatur per user (checkbox)

Permission terpusat: `lib/auth/permissions.ts` + `lib/auth/capabilities.ts`

Kolom `user.level` tetap diisi sebagai kompatibilitas (`user` / `administrator`).

## Struktur folder (ringkas)

```
app/           # Next.js App Router (UI + API)
components/    # UI reusable (layout, ui, domain)
lib/           # server/shared logic per domain + shared/
  auth/ db/ purchasing/ it/ mobil/ platform/ shared/
prisma/        # schema + migrations Prisma
  scripts/legacy/  # SQL one-off (bukan migrate)
docs/          # SETUP, SERVICE-PM2, architecture
scripts/       # PM2 bat helpers
hooks/         # React hooks (shadcn)
types/         # ambient TypeScript declarations
```

## Redirect legacy

URL lama (`/admin/*`, `/user/*`, `/it/dashboard`, dll.) di-redirect otomatis via `middleware.ts`.
