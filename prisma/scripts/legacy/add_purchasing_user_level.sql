-- Tambah level `purchasing` pada enum UserLevel (PostgreSQL)
ALTER TYPE "UserLevel" ADD VALUE IF NOT EXISTS 'purchasing';
