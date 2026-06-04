"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout"
import { TiketDetail } from "@/components/it/TiketDetail"

export default function ItTiketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <DashboardLayout>
      <TiketDetail
        tiketId={id}
        backHref="/it/staff/tiket"
        backLabel="Antrian Tiket"
      />
    </DashboardLayout>
  )
}
