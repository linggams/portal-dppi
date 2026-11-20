import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// DELETE - Delete kategori
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const idJenis = parseInt(decodeURIComponent(id), 10)
    if (isNaN(idJenis)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      )
    }

    // Check if kategori exists
    const kategori = await prisma.jenisBarang.findUnique({
      where: { idJenis },
    })

    if (!kategori) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if kategori is being used in stokbarang (via foreign key)
    const stokCount = await prisma.stokbarang.count({
      where: { idJenis },
    })

    if (stokCount > 0) {
      return NextResponse.json(
        { error: `Category cannot be deleted because it is still used by ${stokCount} item(s)` },
        { status: 400 }
      )
    }

    await prisma.jenisBarang.delete({
      where: { idJenis },
    })

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting kategori:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
