import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessMobil,
  canHandleMobilWorkflow,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { toMobilLaporan } from "@/lib/mobil/map"
import { deleteMobilBukti } from "@/lib/mobil/upload"

const includeLaporan = {
  kendaraan: {
    select: {
      idKendaraan: true,
      nopol: true,
      jenis: { select: { nama: true } },
    },
  },
  perjalanan: {
    orderBy: { urutan: "asc" as const },
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idLaporan = parseInt(id, 10)
    if (!idLaporan || Number.isNaN(idLaporan)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const row = await prisma.mobilLaporanKm.findUnique({
      where: { idLaporan },
      include: includeLaporan,
    })
    if (!row) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    if (
      !canHandleMobilWorkflow(session.user) &&
      row.username !== session.user.username
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(toMobilLaporan(row))
  } catch (error) {
    console.error("Error fetching mobil laporan detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idLaporan = parseInt(id, 10)
    if (!idLaporan || Number.isNaN(idLaporan)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const row = await prisma.mobilLaporanKm.findUnique({
      where: { idLaporan },
      include: { perjalanan: { select: { buktiPath: true } } },
    })
    if (!row) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    for (const trip of row.perjalanan) {
      await deleteMobilBukti(trip.buktiPath)
    }

    const idKendaraan = row.idKendaraan

    await prisma.$transaction(async (tx) => {
      await tx.mobilLaporanKm.delete({ where: { idLaporan } })

      const kendaraan = await tx.mobilKendaraan.findUnique({
        where: { idKendaraan },
        select: { kmAwal: true },
      })
      if (!kendaraan) return

      const remaining = await tx.mobilLaporanKm.findMany({
        where: { idKendaraan },
        include: { perjalanan: { select: { km: true } } },
        orderBy: [{ tanggal: "asc" }, { idLaporan: "asc" }],
      })

      let cursor = kendaraan.kmAwal
      for (const laporan of remaining) {
        const pemakaian = laporan.perjalanan.reduce((sum, t) => sum + t.km, 0)
        const kmAwal = cursor
        const kmAkhir = cursor + pemakaian
        if (laporan.kmAwal !== kmAwal || laporan.kmAkhir !== kmAkhir) {
          await tx.mobilLaporanKm.update({
            where: { idLaporan: laporan.idLaporan },
            data: { kmAwal, kmAkhir },
          })
        }
        cursor = kmAkhir
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting mobil laporan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
