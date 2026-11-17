# Portal Support — Struktur Aplikasi

## Domain

| Domain | Route UI | API | DB prefix |
|--------|----------|-----|-----------|
| Purchasing | `/purchasing/admin/*`, `/purchasing/user/*` | `/api/purchasing/*` | `atk_*` |
| IT Management | `/itms/console/*`, `/itms/portal/*` | `/api/itms/*` | `itms_*` |
| Penggunaan Mobil | `/mobil/admin/*`, `/mobil/user/*` | `/api/mobil/*` | `mobil_*` |
| Platform | `/platform/*` | `/api/platform/*` | `user`, `role` |

Legacy **IT Support** (`/it`, `it_*`) has been removed. Old URLs redirect to IT Management (`/itms`).

## Role & akses

- **Pemohon** (`user`) → akses modul Purchasing / IT Management / Mobil diatur per user
- **Pengelola** (`administrator`) → kelola user + dashboard; modul diatur per user

Permission terpusat: `lib/auth/permissions.ts` + `lib/auth/capabilities.ts`

IT Management flags: `accessItms` / `manageItms`

## Struktur folder (ringkas)

```
app/           # Next.js App Router (UI + API)
components/    # UI reusable (layout, ui, domain)
lib/           # server/shared logic per domain + shared/
  auth/ db/ purchasing/ itms/ mobil/ platform/ shared/
prisma/        # schema + migrations Prisma
  scripts/legacy/  # SQL one-off (bukan migrate)
docs/          # SETUP, SERVICE-PM2, architecture, itms
scripts/       # PM2 bat helpers
hooks/         # React hooks (shadcn)
types/         # ambient TypeScript declarations
```

## Redirect legacy

URL lama (`/admin/*`, `/user/*`, `/it/*`) di-redirect otomatis via `middleware.ts`.
