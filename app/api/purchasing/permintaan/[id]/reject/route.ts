import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandlePurchasingWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// POST - Reject permintaan (only for admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canHandlePurchasingWorkflow(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get permintaan
    const permintaan = await prisma.permintaan.findUnique({
      where: { idPermintaan: parseInt(id) },
    })

    if (!permintaan) {
      return NextResponse.json(
        { error: "Permintaan tidak ditemukan" },
        { status: 404 }
      )
    }

    if (permintaan.status !== 0) {
      return NextResponse.json(
        { error: "Permintaan sudah diproses" },
        { status: 400 }
      )
    }

    // Update permintaan status to rejected
    await prisma.permintaan.update({
      where: { idPermintaan: parseInt(id) },
      data: { status: 2 }, // Rejected
    })

    return NextResponse.json({ message: "Permintaan berhasil ditolak" })
  } catch (error) {
    console.error("Error rejecting permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
