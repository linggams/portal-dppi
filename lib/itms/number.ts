import type { ItmsTicketType } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

export async function generateTicketNumber(
  type: ItmsTicketType
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = type === "service_request" ? `SR-${year}-` : `INC-${year}-`

  const last = await prisma.itmsTicket.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  })

  let seq = 1
  if (last?.number) {
    const part = last.number.slice(prefix.length)
    const n = parseInt(part, 10)
    if (!Number.isNaN(n)) seq = n + 1
  }

  return `${prefix}${String(seq).padStart(6, "0")}`
}
