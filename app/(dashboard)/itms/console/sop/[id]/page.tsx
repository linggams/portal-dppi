"use client"

import { use } from "react"
import { ItmsDocumentConsoleDetail } from "@/components/itms/DocumentConsoleDetail"

export default function ItmsConsoleSopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const documentId = Number(id)
  if (Number.isNaN(documentId)) {
    return null
  }
  return <ItmsDocumentConsoleDetail documentId={documentId} />
}
