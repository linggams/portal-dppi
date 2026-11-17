if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:mokmok@localhost:5432/atk?schema=public"
}

import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const articles = await prisma.itmsKbDocument.findMany({
    where: { kind: "article" },
  })
  for (const doc of articles) {
    await prisma.itmsKbDocument.update({
      where: { idDocument: doc.idDocument },
      data: { idCurrentVersion: null },
    })
    await prisma.itmsKbAcknowledgment.deleteMany({
      where: { idDocument: doc.idDocument },
    })
    await prisma.itmsKbVersion.deleteMany({
      where: { idDocument: doc.idDocument },
    })
    await prisma.itmsKbDocument.delete({
      where: { idDocument: doc.idDocument },
    })
    console.log(`Deleted article ${doc.idDocument}: ${doc.title}`)
  }
  if (articles.length === 0) console.log("No article documents left")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
