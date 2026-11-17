"use client"

import { use } from "react"
import { DashboardLayout } from "@/components/layout"
import { ItmsTicketDetail } from "@/components/itms/TicketDetail"

export default function ItmsConsoleTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const ticketId = parseInt(id, 10)

  return (
    <DashboardLayout>
      <ItmsTicketDetail ticketId={ticketId} basePath="/itms/console" />
    </DashboardLayout>
  )
}
