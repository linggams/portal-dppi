import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { prisma } from "@/lib/db/prisma"

// POST - Submit semua pengajuan sementara menjadi pengajuan
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { unit, tglPengajuan } = body

    if (session.user.username !== unit) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all sementara for this unit and date
    const sementaraList = await prisma.pengajuanSementara.findMany({
      where: {
        unit,
        tglPengajuan: new Date(tglPengajuan),
        status: 0,
      },
      include: {
        stokbarang: true,
      },
    })

    if (sementaraList.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada pengajuan untuk disubmit" },
        { status: 400 }
      )
    }

    // Create pengajuan for each item
    const pengajuanList = []
    for (const item of sementaraList) {
      const pengajuan = await prisma.pengajuan.create({
        data: {
          unit: item.unit,
          kodeBrg: item.kodeBrg,
          idJenis: item.idJenis,
          jumlah: item.jumlah,
          satuan: item.satuan,
          hargabarang: item.hargabarang,
          total: item.total,
          tglPengajuan: item.tglPengajuan,
          status: 0, // Pending
        },
        include: {
          stokbarang: true,
        },
      })
      pengajuanList.push(pengajuan)
    }

    // Delete all sementara
    await prisma.pengajuanSementara.deleteMany({
      where: {
        unit,
        tglPengajuan: new Date(tglPengajuan),
        status: 0,
      },
    })

    return NextResponse.json({
      message: "Pengajuan berhasil disubmit",
      count: pengajuanList.length,
      data: pengajuanList,
    })
  } catch (error) {
    console.error("Error submitting pengajuan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
