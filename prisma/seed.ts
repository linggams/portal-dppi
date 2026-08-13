// IMPORTANT: Set DATABASE_URL as the very first thing, before any imports
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'
}

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { SYSTEM_ROLES } from '../lib/auth/capabilities'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'

// Create PostgreSQL adapter for Prisma 7
const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')
  console.log('📡 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'NOT SET')

  console.log('🔐 Seeding Role...')
  for (const role of SYSTEM_ROLES) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        homePath: role.homePath,
        canAccessPlatform: role.canAccessPlatform,
        canAccessPurchasingUser: role.canAccessPurchasingUser,
        canHandlePurchasingWorkflow: role.canHandlePurchasingWorkflow,
        canManagePurchasingMaster: role.canManagePurchasingMaster,
        canAccessItUser: role.canAccessItUser,
        canAccessItStaff: role.canAccessItStaff,
      },
      create: { ...role },
    })
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { code: 'administrator' },
  })

  // Seed User
  console.log('👤 Seeding User...')
  await prisma.user.upsert({
    where: { username: 'sheva' },
    update: {
      roleId: adminRole.idRole,
      level: 'administrator',
      managePurchasing: true,
      manageIt: true,
      manageDana: true,
    },
    create: {
      username: 'sheva',
      password: '56125c418bb93293b42172a9eb031040',
      level: 'administrator',
      jabatan: 'Purchasing',
      roleId: adminRole.idRole,
      managePurchasing: true,
      manageIt: true,
      manageDana: true,
    },
  })

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
