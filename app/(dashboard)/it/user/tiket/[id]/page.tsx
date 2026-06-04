"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout"
import { TiketDetail } from "@/components/it/TiketDetail"

export default function UserTiketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <DashboardLayout>
      <TiketDetail
        tiketId={id}
        backHref="/it/user/tiket"
        backLabel="Tiket Saya"
      />
    </DashboardLayout>
  )
}
