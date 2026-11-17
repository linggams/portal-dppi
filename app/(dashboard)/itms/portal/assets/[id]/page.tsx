"use client"

import { use, useCallback, useEffect, useState } from "react"
import { DashboardLayout, ContentEmpty } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { ASSET_STATUS_LABEL } from "@/lib/itms/assets"
import { formatTicketDate } from "@/lib/itms/format"
import type { ItmsAssetStatus } from "@prisma/client"

type AssetDetail = {
  idAsset: number
  tag: string
  type: string
  serialNumber: string | null
  brand: string
  model: string
  specs: string
  location: string
  status: ItmsAssetStatus
  warrantyUntil: string | null
}

export default function ItmsPortalAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const assetId = parseInt(id, 10)
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const pageTitle = asset?.tag ?? "Asset"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/itms/assets/${assetId}`)
      if (!res.ok) {
        setAsset(null)
        return
      }
      setAsset(await res.json())
    } finally {
      setLoading(false)
    }
  }, [assetId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <DashboardLayout title={pageTitle}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </DashboardLayout>
    )
  }
  if (!asset) {
    return (
      <DashboardLayout title={pageTitle}>
        <ContentEmpty title="Asset not found" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={pageTitle}>
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{asset.tag}</h1>
          <Badge variant="secondary">{ASSET_STATUS_LABEL[asset.status]}</Badge>
        </div>
        <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Type</span>
            <br />
            {asset.type}
          </p>
          <p>
            <span className="text-muted-foreground">Brand / Model</span>
            <br />
            {[asset.brand, asset.model].filter(Boolean).join(" ") || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Serial</span>
            <br />
            {asset.serialNumber || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Location</span>
            <br />
            {asset.location || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Warranty until</span>
            <br />
            {asset.warrantyUntil
              ? formatTicketDate(asset.warrantyUntil)
              : "—"}
          </p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Specs</span>
            <br />
            <span className="whitespace-pre-wrap">{asset.specs || "—"}</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
