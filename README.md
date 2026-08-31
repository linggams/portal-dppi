# DPPI

Aplikasi pengajuan barang (Purchasing) dan tiket gangguan IT — Next.js + PostgreSQL + Prisma.

## Dokumentasi

- [docs/SETUP.md](./docs/SETUP.md) — instalasi development & database
- [docs/SERVICE-PM2.md](./docs/SERVICE-PM2.md) — production Windows (PM2)
- [docs/architecture.md](./docs/architecture.md) — struktur modul & level user

## Perintah cepat

```bash
pnpm install
pnpm exec prisma generate
pnpm dev          # http://localhost:2000
pnpm build
pnpm pm2:start    # production (lihat docs/SERVICE-PM2.md)
```
