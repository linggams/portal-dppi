// IMPORTANT: Set DATABASE_URL as the very first thing, before any imports
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'
}

import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { SYSTEM_ROLES } from '../lib/auth/capabilities'

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'

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
      },
      create: { ...role },
    })
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { code: 'administrator' },
  })

  console.log('👤 Seeding User...')
  await prisma.user.upsert({
    where: { username: 'sheva' },
    update: {
      roleId: adminRole.idRole,
      level: 'administrator',
      managePurchasing: true,
      manageItms: true,
      manageMobil: true,
      accessPurchasing: false,
      accessItms: false,
      accessMobil: false,
    },
    create: {
      username: 'sheva',
      password: '56125c418bb93293b42172a9eb031040',
      level: 'administrator',
      jabatan: 'Purchasing',
      roleId: adminRole.idRole,
      managePurchasing: true,
      manageItms: true,
      manageMobil: true,
      accessPurchasing: false,
      accessItms: false,
      accessMobil: false,
    },
  })

  const adminPassword = await bcrypt.hash('atk123456', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPassword,
      roleId: adminRole.idRole,
      level: 'administrator',
      jabatan: 'Administrator',
      managePurchasing: true,
      manageItms: true,
      manageMobil: true,
      accessPurchasing: true,
      accessItms: true,
      accessMobil: true,
    },
    create: {
      username: 'admin',
      password: adminPassword,
      level: 'administrator',
      jabatan: 'Administrator',
      roleId: adminRole.idRole,
      managePurchasing: true,
      manageItms: true,
      manageMobil: true,
      accessPurchasing: true,
      accessItms: true,
      accessMobil: true,
    },
  })

  console.log('🎫 Seeding ITMS categories & SLA...')
  const itmsCategories = [
    'Hardware',
    'Software',
    'Network',
    'Email & Accounts',
    'Printer',
    'Access Request',
    'Other',
  ]
  for (const name of itmsCategories) {
    const existing = await prisma.itmsCategory.findFirst({ where: { name } })
    if (!existing) {
      await prisma.itmsCategory.create({ data: { name, active: true } })
    }
  }

  const slaDefaults: Array<{
    priority: 'p1' | 'p2' | 'p3' | 'p4'
    responseMinutes: number
    resolutionMinutes: number
  }> = [
    { priority: 'p1', responseMinutes: 15, resolutionMinutes: 240 },
    { priority: 'p2', responseMinutes: 60, resolutionMinutes: 480 },
    { priority: 'p3', responseMinutes: 240, resolutionMinutes: 1440 },
    { priority: 'p4', responseMinutes: 480, resolutionMinutes: 2400 },
  ]
  for (const policy of slaDefaults) {
    await prisma.itmsSlaPolicy.upsert({
      where: { priority: policy.priority },
      update: {
        responseMinutes: policy.responseMinutes,
        resolutionMinutes: policy.resolutionMinutes,
        active: true,
      },
      create: { ...policy, active: true },
    })
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
