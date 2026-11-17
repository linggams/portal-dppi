"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardLayout, ContentEmpty } from "@/components/layout"
import { SopDocumentShell } from "@/components/itms/SopDocumentShell"
import { Button } from "@/components/ui/button"
import { formatTicketDate } from "@/lib/itms/format"

type DocDetail = {
  idDocument: number
  kind: "sop"
  number: string | null
  title: string
  tags: string
  effectiveDate: string | null
  nextReviewAt: string | null
  acknowledgedAt: string | null
  currentVersion: {
    version: number
    body: string
  } | null
}

export function ItmsDocumentPortalReader({
  documentId,
}: {
  documentId: number
}) {
  const [doc, setDoc] = useState<DocDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const pageTitle = doc?.title ?? "SOP"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/itms/knowledge/${documentId}`)
      if (!res.ok) {
        setDoc(null)
        return
      }
      const data = await res.json()
      if (data.kind !== "sop") {
        setDoc(null)
        return
      }
      setDoc(data)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    load()
  }, [load])

  const acknowledge = async () => {
    setBusy(true)
    try {
      const res = await fetch(`/api/itms/knowledge/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Action failed")
        return
      }
      setDoc((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              acknowledgedAt:
                data.acknowledgedAt ?? new Date().toISOString(),
            }
          : data
      )
      toast.success("SOP acknowledged")
    } catch {
      toast.error("Action failed")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title={pageTitle}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </DashboardLayout>
    )
  }
  if (!doc) {
    return (
      <DashboardLayout title={pageTitle}>
        <ContentEmpty title="SOP not found" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={pageTitle}>
      <SopDocumentShell
        backHref="/itms/portal/sop"
        backLabel="Back to SOP register"
        doc={{
          number: doc.number,
          title: doc.title,
          tags: doc.tags,
          effectiveDate: doc.effectiveDate,
          nextReviewAt: doc.nextReviewAt,
          version: doc.currentVersion?.version ?? null,
          body: doc.currentVersion?.body ?? "",
          acknowledgedAt: doc.acknowledgedAt,
        }}
        footer={
          doc.acknowledgedAt ? (
            <p className="text-sm text-muted-foreground">
              You acknowledged revision{" "}
              {doc.currentVersion?.version ?? "—"} on{" "}
              {formatTicketDate(doc.acknowledgedAt)}.
            </p>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm text-muted-foreground">
                Confirm that you have read and understood this controlled
                procedure.
              </p>
              <Button disabled={busy} onClick={acknowledge}>
                Acknowledge SOP
              </Button>
            </div>
          )
        }
      />
    </DashboardLayout>
  )
}
