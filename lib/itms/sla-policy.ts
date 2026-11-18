import type { ItmsPriority } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

export async function getSlaPolicyForPriority(priority: ItmsPriority) {
  return prisma.itmsSlaPolicy.findFirst({
    where: { priority, active: true },
  })
}
