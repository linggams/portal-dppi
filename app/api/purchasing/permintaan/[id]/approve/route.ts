import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandlePurchasingWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// POST - Approve permintaan (only for admin)
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
      include: {
        stokbarang: true,
      },
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

    // Check stok availability
    if (permintaan.stokbarang.sisa < permintaan.jumlah) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Stok tersedia: ${permintaan.stokbarang.sisa}` },
        { status: 400 }
      )
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update permintaan status to approved
      await tx.permintaan.update({
        where: { idPermintaan: parseInt(id) },
        data: { status: 1 }, // Approved
      })

      // Create pengeluaran record
      await tx.pengeluaran.create({
        data: {
          unit: permintaan.unit,
          kodeBrg: permintaan.kodeBrg,
          jumlah: permintaan.jumlah,
          tglKeluar: new Date(),
        },
      })

      // Update stok barang
      await tx.stokbarang.update({
        where: { idKodeBrg: permintaan.stokbarang.idKodeBrg },
        data: {
          keluar: {
            increment: permintaan.jumlah,
          },
          sisa: {
            decrement: permintaan.jumlah,
          },
        },
      })
    })

    return NextResponse.json({ message: "Permintaan berhasil disetujui" })
  } catch (error) {
    console.error("Error approving permintaan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
