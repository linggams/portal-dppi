import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const PRISMA_CLIENT_REV = 9

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaRev?: number
}

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mokmok@localhost:5432/atk?schema=public'

function createPrismaClient() {
  try {
    const pool = new Pool({ 
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })
    
    const adapter = new PrismaPg(pool)
    
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.error('Failed to create Prisma adapter:', error)
    throw error
  }
}

function isStaleClient(client: PrismaClient) {
  if (globalForPrisma.prismaRev !== PRISMA_CLIENT_REV) return true
  const c = client as {
    danaPengajuan?: { findMany?: unknown }
    mobilJenis?: { findMany?: unknown }
  }
  return (
    typeof c.danaPengajuan?.findMany !== "function" ||
    typeof c.mobilJenis?.findMany !== "function"
  )
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma
  if (existing && !isStaleClient(existing)) {
    return existing
  }

  if (existing) {
    existing.$disconnect().catch(() => {})
  }

  const client = createPrismaClient()
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client
    globalForPrisma.prismaRev = PRISMA_CLIENT_REV
  }
  return client
}

export const prisma = getPrismaClient()
