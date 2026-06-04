import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessItUser } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  buildQueuePositionMap,
  getQueuePosition,
  isTiketInQueue,
  IT_QUEUE_ACTIVE_STATUSES,
} from "@/lib/it/queue"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessItUser(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const username = session.user.username

    const allInQueue = await prisma.itTiket.findMany({
      where: {
        status: { in: IT_QUEUE_ACTIVE_STATUSES },
      },
      select: {
        idTiket: true,
        nomorTiket: true,
        username: true,
        judul: true,
        status: true,
        prioritas: true,
        tglDibuat: true,
        kategori: { select: { nama: true } },
      },
      orderBy: { tglDibuat: "asc" },
    })

    const positionMap = buildQueuePositionMap(allInQueue)
    const totalAntrian = positionMap.size

    const tiketUser = await prisma.itTiket.findMany({
      where: { username },
      select: {
        idTiket: true,
        nomorTiket: true,
        judul: true,
        status: true,
        prioritas: true,
        tglDibuat: true,
        kategori: { select: { nama: true } },
      },
      orderBy: { tglDibuat: "desc" },
    })

    const antrianSaya = tiketUser
      .filter((t) => isTiketInQueue(t.status))
      .map((t) => {
        const posisiAntrian = getQueuePosition(t.idTiket, positionMap)
        return {
          idTiket: t.idTiket,
          nomorTiket: t.nomorTiket,
          judul: t.judul,
          status: t.status,
          prioritas: t.prioritas,
          tglDibuat: t.tglDibuat,
          kategori: t.kategori,
          posisiAntrian,
          antrianDiDepan:
            posisiAntrian != null ? Math.max(0, posisiAntrian - 1) : null,
          totalAntrian,
        }
      })
      .sort((a, b) => (a.posisiAntrian ?? 999) - (b.posisiAntrian ?? 999))

    return NextResponse.json({
      totalAntrian,
      antrianSaya,
      tiketSelesai: tiketUser.filter((t) => !isTiketInQueue(t.status)).length,
    })
  } catch (error) {
    console.error("Error fetching antrian tiket:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
