import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandlePurchasingWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

// POST - Approve pengajuan (only for admin)
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

    // Get pengajuan
    const pengajuan = await prisma.pengajuan.findUnique({
      where: { idPengajuan: parseInt(id) },
      include: {
        stokbarang: true,
      },
    })

    if (!pengajuan) {
      return NextResponse.json(
        { error: "Pengajuan tidak ditemukan" },
        { status: 404 }
      )
    }

    if (pengajuan.status !== 0) {
      return NextResponse.json(
        { error: "Pengajuan sudah diproses" },
        { status: 400 }
      )
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update pengajuan status to approved
      await tx.pengajuan.update({
        where: { idPengajuan: parseInt(id) },
        data: { status: 1 }, // Approved
      })

      // Create pemasukan record
      await tx.pemasukan.create({
        data: {
          unit: pengajuan.unit,
          kodeBrg: pengajuan.kodeBrg,
          jumlah: pengajuan.jumlah,
          tglMasuk: new Date(),
        },
      })

      // Update stok barang (increase stok and sisa)
      await tx.stokbarang.update({
        where: { idKodeBrg: pengajuan.stokbarang.idKodeBrg },
        data: {
          stok: {
            increment: pengajuan.jumlah,
          },
          sisa: {
            increment: pengajuan.jumlah,
          },
        },
      })
    })

    return NextResponse.json({ message: "Pengajuan berhasil disetujui" })
  } catch (error) {
    console.error("Error approving pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
