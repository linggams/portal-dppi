import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManageItTiket } from "@/lib/it/constants"
import {
  aggregateByKategori,
  aggregateByTeknisi,
  buildTiketLaporanWhere,
  computeItLaporanSummary,
  type ItLaporanTab,
} from "@/lib/it/laporan"
import { prisma } from "@/lib/db/prisma"

function parseFilters(searchParams: URLSearchParams) {
  return {
    startDate: searchParams.get("start_date"),
    endDate: searchParams.get("end_date"),
    status: searchParams.get("status") ?? "all",
    prioritas: searchParams.get("prioritas") ?? "all",
    kategoriId: searchParams.get("kategori_id") ?? "all",
    username: searchParams.get("username"),
    ditugaskanKe: searchParams.get("ditugaskan_ke"),
    dateField:
      searchParams.get("date_field") === "selesai" ? "selesai" : "dibuat",
  } as const
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tab = (searchParams.get("tab") ?? "tiket") as ItLaporanTab
    const filters = parseFilters(searchParams)
    const where = buildTiketLaporanWhere(filters)

    const tiket = await prisma.itTiket.findMany({
      where,
      include: {
        kategori: { select: { idKategori: true, nama: true } },
      },
      orderBy: { tglDibuat: "desc" },
    })

    const summary = computeItLaporanSummary(tiket)

    let data: unknown[] = tiket
    if (tab === "kategori") {
      data = aggregateByKategori(tiket)
    } else if (tab === "teknisi") {
      data = aggregateByTeknisi(tiket)
    }

    return NextResponse.json({ data, summary, tab })
  } catch (error) {
    console.error("Error fetching IT laporan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
