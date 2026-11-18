/**
 * Enable ITMS staff flag on existing managers/admins without deleting any data.
 * Does not revoke flags, delete users, or wipe ITMS rows.
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

  try {
    const before = await prisma.user.findMany({
      select: {
        idUser: true,
        username: true,
        level: true,
        managePurchasing: true,
        manageItms: true,
        manageMobil: true,
        accessPurchasing: true,
        accessItms: true,
        accessMobil: true,
      },
      orderBy: { idUser: "asc" },
    })
    console.log("Before:", JSON.stringify(before, null, 2))

    // Hanya nyalakan manageItms (tidak mematikan flag lain, tidak menghapus user)
    const staff = await prisma.user.updateMany({
      where: {
        manageItms: false,
        OR: [
          { level: "administrator" },
          { managePurchasing: true },
          { manageMobil: true },
        ],
      },
      data: { manageItms: true },
    })

    // Ensure ITMS categories exist (create only if missing)
    const categoryNames = [
      "Hardware",
      "Software",
      "Network",
      "Email & Accounts",
      "Printer",
      "Access Request",
      "Other",
    ]
    let categoriesCreated = 0
    for (const name of categoryNames) {
      const existing = await prisma.itmsCategory.findFirst({ where: { name } })
      if (!existing) {
        await prisma.itmsCategory.create({ data: { name, active: true } })
        categoriesCreated += 1
      }
    }

    // Ensure SLA policies exist (upsert — no deletes)
    const slaDefaults = [
      { priority: "p1" as const, responseMinutes: 15, resolutionMinutes: 240 },
      { priority: "p2" as const, responseMinutes: 60, resolutionMinutes: 480 },
      { priority: "p3" as const, responseMinutes: 240, resolutionMinutes: 1440 },
      { priority: "p4" as const, responseMinutes: 480, resolutionMinutes: 2400 },
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

    const after = await prisma.user.findMany({
      select: {
        idUser: true,
        username: true,
        level: true,
        manageItms: true,
        accessItms: true,
      },
      orderBy: { idUser: "asc" },
    })

    console.log(
      JSON.stringify(
        {
          staffUpdated: staff.count,
          categoriesCreated,
          after,
        },
        null,
        2
      )
    )
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
