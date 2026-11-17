"use client"

import { use } from "react"
import { ItmsDocumentPortalReader } from "@/components/itms/DocumentPortalReader"

export default function ItmsPortalSopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const documentId = Number(id)
  if (Number.isNaN(documentId)) {
    return null
  }
  return <ItmsDocumentPortalReader documentId={documentId} />
}
