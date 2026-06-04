# DPPI — Production dengan PM2 (Windows)

PM2 menjalankan aplikasi Next.js di port **2000** dengan auto-restart dan log terpusat.

## Prasyarat

- Node.js 18+
- `pnpm install` sudah dijalankan di folder project
- File `.env` sudah benar (`DATABASE_URL`, `NEXTAUTH_*`, dll.)
- PostgreSQL berjalan

## Instalasi pertama kali

### 1. Build & jalankan PM2

Dari folder project (CMD atau PowerShell):

```batch
pnpm build
pnpm pm2:start
pnpm pm2:save
```

Atau pakai skrip bantu:

```batch
scripts\pm2-setup.bat
```

### 2. Auto-start saat Windows boot (opsional, disarankan server)

Jalankan **CMD/PowerShell sebagai Administrator**:

```batch
cd C:\path\ke\project
pnpm exec pm2 startup
```

PM2 akan menampilkan perintah yang harus dijalankan (copy-paste lalu Enter). Setelah itu:

```batch
pnpm pm2:save
```

## Perintah sehari-hari

| Tujuan | Perintah |
|--------|----------|
| Start | `pnpm pm2:start` |
| Stop | `pnpm pm2:stop` |
| Restart | `pnpm pm2:restart` |
| Status semua proses | `pnpm exec pm2 status` |
| Log live | `pnpm pm2:logs` |
| Hapus dari daftar PM2 | `pnpm pm2:delete` |
| Deploy (build + restart) | `pnpm pm2:deploy` |

## Setelah update kode

```batch
pnpm pm2:deploy
```

Atau manual:

```batch
pnpm build
pnpm pm2:restart
```

## Log

- PM2: folder `logs/` → `pm2-out.log`, `pm2-error.log`
- Lihat langsung: `pnpm pm2:logs`

## Troubleshooting

### Port 2000 sudah dipakai

```batch
netstat -ano | findstr :2000
```

Hentikan proses lain atau ubah port di `ecosystem.config.cjs` dan `package.json` (`start` / `dev`).

### Aplikasi restart terus

```batch
pnpm pm2:logs
```

Cek koneksi database, `.env`, dan apakah sudah `pnpm build`.

### PM2 kosong setelah reboot

Ulangi (Administrator):

```batch
pnpm exec pm2 startup
pnpm pm2:save
```

### Path project pindah

1. `pnpm pm2:delete`
2. Pindahkan folder project
3. `pnpm install`
4. `pnpm build`
5. `pnpm pm2:start`
6. `pnpm pm2:save`

## File terkait

- `ecosystem.config.cjs` — konfigurasi proses `dppi`
- `scripts/pm2-setup.bat` — build + start + save
- `scripts/pm2-startup-install.bat` — panduan `pm2 startup` (admin)
