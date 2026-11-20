import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandlePurchasingWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// POST - Reject pengajuan (only for admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canHandlePurchasingWorkflow(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get pengajuan
    const pengajuan = await prisma.pengajuan.findUnique({
      where: { idPengajuan: parseInt(id) },
    })

    if (!pengajuan) {
      return NextResponse.json(
        { error: "Purchase request not found" },
        { status: 404 }
      )
    }

    if (pengajuan.status !== 0) {
      return NextResponse.json(
        { error: "Purchase request already processed" },
        { status: 400 }
      )
    }

    // Update pengajuan status to rejected
    await prisma.pengajuan.update({
      where: { idPengajuan: parseInt(id) },
      data: { status: 2 }, // Rejected
    })

    return NextResponse.json({ message: "Purchase request rejected successfully" })
  } catch (error) {
    console.error("Error rejecting pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
