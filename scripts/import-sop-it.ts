/**
 * Upsert SOP documents into the database from the portable fixture
 * (prisma/data/sop-documents.json).
 *
 * To refresh the fixture from D:\dev\sop-it first:
 *   pnpm db:generate-sop-fixture
 *
 * Usage: pnpm db:import-sop-it
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:mokmok@localhost:5432/atk?schema=public"
}

import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { seedSopDocuments } from "../prisma/seed-sop"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  await seedSopDocuments(prisma)
  const counts = await prisma.itmsKbDocument.groupBy({
    by: ["kind", "status"],
    _count: true,
  })
  console.log("Done. Document counts:", counts)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
