// IMPORTANT: Set DATABASE_URL as the very first thing, before any imports
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'
}

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'

// Create PostgreSQL adapter for Prisma 7
const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')
  console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET')

  // Seed User
  console.log('👤 Seeding User...')
  const users = [
    { username: 'sheva', password: '56125c418bb93293b42172a9eb031040', level: 'administrator' as const, jabatan: 'Purchasing' },
    { username: 'ratih', password: 'c5d2c604b2051517c3a709ebb5723d38', level: 'user' as const, jabatan: 'EXIM' },
    { username: 'yetti', password: 'fcf33583572d4dc7c98c6c71fe040619', level: 'user' as const, jabatan: 'PPIC Gap' },
    { username: 'bulan', password: 'a7750882e3748bea67aa5e3c76926676', level: 'user' as const, jabatan: 'QA' },
    { username: 'novita', password: '77ba22ae2ba681b26c596cd530d6e872', level: 'user' as const, jabatan: 'Accounting ' },
    { username: 'ajeng', password: '1e6422e72fcc3ba7aeca0521e8aecfc4', level: 'user' as const, jabatan: 'Cutting' },
    { username: 'fauza', password: 'a42c08887cd2b924be7ac289d3501008', level: 'user' as const, jabatan: 'GEDUNG 1' },
    { username: 'minar', password: '9bad128aea76e7a7d330f78bfbb29fcc', level: 'user' as const, jabatan: 'GEDUNG 2' },
    { username: 'yani', password: 'd8c8b2ecc2a2be37dc4c4ec716998c17', level: 'user' as const, jabatan: 'PPIC Target' },
    { username: 'Resti', password: 'bb52ab351d667aa8e4fe792deb726f13', level: 'user' as const, jabatan: 'Warehouse Fabric' },
    { username: 'Putri', password: '8b89881b28a3f5741810c9249d815877', level: 'user' as const, jabatan: 'QC' },
    { username: 'Mega', password: '80b98ba8fa5431451d6417ed83abc90a', level: 'user' as const, jabatan: 'COMPLIANCE' },
    { username: 'Heni', password: '9c205bf7e7a0780ceaf1b799cf741802', level: 'user' as const, jabatan: 'Mechanic' },
    { username: 'ANDRIA', password: '3b41790f94456f7ab56d1558eaf6d5da', level: 'user' as const, jabatan: 'HRD' },
    { username: 'Via', password: 'efc5f749e9ff4adbc137e0bc1a31d242', level: 'user' as const, jabatan: 'WH Acc' },
    { username: 'Fauziah', password: 'b16bd410e4f81dc3b65e8b8eb35058c0', level: 'user' as const, jabatan: 'Sample' },
    { username: 'dwi', password: '87ef34ff9900b3cffa85dfaf65bbfaf6', level: 'user' as const, jabatan: 'Cutting' },
    { username: 'Lastri ', password: '300375db3d0aeab4b48eac7899dc3a62', level: 'user' as const, jabatan: 'QC 1' },
    { username: 'Vera ', password: '7de45db666793543bd441edf745de260', level: 'user' as const, jabatan: 'PATTERN ' },
    { username: 'iprati', password: 'fe498a6d1e5c4ba28c7676bc62b199a3', level: 'user' as const, jabatan: 'EXIM' },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    })
  }

  // Seed IT ticket categories
  console.log('🎫 Seeding IT kategori...')
  const itKategori = [
    'Hardware',
    'Software',
    'Jaringan / Internet',
    'Email & Akun',
    'Printer',
    'Lainnya',
  ]

  for (const nama of itKategori) {
    const existing = await prisma.itTiketKategori.findFirst({ where: { nama } })
    if (!existing) {
      await prisma.itTiketKategori.create({ data: { nama, aktif: true } })
    }
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
