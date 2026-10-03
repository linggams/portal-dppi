import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessItUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { IT_QUEUE_ACTIVE_STATUSES } from "@/lib/it/queue"
import { requireUserId } from "@/lib/purchasing/actor"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItUser(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = requireUserId(session.user.id)

    const allInQueue = await prisma.itTiket.findMany({
      where: {
        status: { in: IT_QUEUE_ACTIVE_STATUSES },
      },
      select: {
        idTiket: true,
        nomorTiket: true,
        judul: true,
        status: true,
        tglDibuat: true,
        pemohon: { select: { idUser: true, username: true } },
        petugas: { select: { username: true } },
        kategori: { select: { nama: true } },
      },
      orderBy: { tglDibuat: "asc" },
    })

    const totalAntrian = allInQueue.length

    const antrianGlobal = allInQueue.map((t, index) => {
      const posisiAntrian = index + 1
      return {
        idTiket: t.idTiket,
        nomorTiket: t.nomorTiket,
        username: t.pemohon.username,
        judul: t.judul,
        status: t.status,
        ditugaskanKe: t.petugas?.username ?? null,
        tglDibuat: t.tglDibuat,
        kategori: t.kategori,
        posisiAntrian,
        antrianDiDepan: Math.max(0, posisiAntrian - 1),
        totalAntrian,
        isMine: t.pemohon.idUser === userId,
      }
    })

    const antrianSaya = antrianGlobal.filter((t) => t.isMine)

    return NextResponse.json({
      totalAntrian,
      antrianGlobal,
      antrianSaya,
    })
  } catch (error) {
    console.error("Error fetching antrian tiket:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
