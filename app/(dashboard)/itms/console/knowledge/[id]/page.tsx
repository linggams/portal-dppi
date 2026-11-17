import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db/prisma"

export default async function ItmsConsoleKnowledgeDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  if (Number.isNaN(id)) notFound()

  const doc = await prisma.itmsKbDocument.findUnique({
    where: { idDocument: id },
    select: { kind: true },
  })
  if (!doc || doc.kind !== "sop") notFound()

  redirect(`/itms/console/sop/${id}`)
}
