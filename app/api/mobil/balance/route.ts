import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessMobil } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

/** KM awal otomatis untuk form input (balance terakhir kendaraan). */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const idKendaraan = parseInt(
      request.nextUrl.searchParams.get("id_kendaraan") ?? "",
      10
    )
    if (!idKendaraan || Number.isNaN(idKendaraan)) {
      return NextResponse.json({ error: "id_kendaraan wajib" }, { status: 400 })
    }

    const kendaraan = await prisma.mobilKendaraan.findUnique({
      where: { idKendaraan },
    })
    if (!kendaraan) {
      return NextResponse.json({ error: "Kendaraan tidak ditemukan" }, { status: 404 })
    }

    const last = await prisma.mobilLaporanKm.findFirst({
      where: { idKendaraan },
      orderBy: [{ tanggal: "desc" }, { idLaporan: "desc" }],
    })

    return NextResponse.json({
      idKendaraan,
      nopol: kendaraan.nopol,
      kmAwal: last?.kmAkhir ?? kendaraan.kmAwal,
    })
  } catch (error) {
    console.error("Error fetching mobil balance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
