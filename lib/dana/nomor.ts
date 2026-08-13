import { prisma } from "@/lib/db/prisma"

export async function generateNomorPengajuanDana(): Promise<string> {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const prefix = `PD-${y}${m}-`

  const last = await prisma.danaPengajuan.findFirst({
    where: { nomor: { startsWith: prefix } },
    orderBy: { nomor: "desc" },
    select: { nomor: true },
  })

  let seq = 1
  if (last?.nomor) {
    const part = last.nomor.slice(prefix.length)
    const n = parseInt(part, 10)
    if (!Number.isNaN(n)) seq = n + 1
  }

  return `${prefix}${String(seq).padStart(4, "0")}`
}
