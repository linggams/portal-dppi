import { prisma } from "@/lib/db/prisma"

export async function generateNomorTiket(): Promise<string> {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, "0")
  const d = String(today.getDate()).padStart(2, "0")
  const prefix = `IT-${y}${m}${d}-`

  const last = await prisma.itTiket.findFirst({
    where: { nomorTiket: { startsWith: prefix } },
    orderBy: { nomorTiket: "desc" },
    select: { nomorTiket: true },
  })

  let seq = 1
  if (last?.nomorTiket) {
    const part = last.nomorTiket.slice(prefix.length)
    const n = parseInt(part, 10)
    if (!Number.isNaN(n)) seq = n + 1
  }

  return `${prefix}${String(seq).padStart(3, "0")}`
}
