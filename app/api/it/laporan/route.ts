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
import {
  paginateArray,
  parsePaginationParams,
} from "@/lib/shared/pagination"

function parseFilters(searchParams: URLSearchParams) {
  return {
    startDate: searchParams.get("start_date"),
    endDate: searchParams.get("end_date"),
    status: searchParams.get("status") ?? "all",
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
    if (!session || !canManageItTiket(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tab = (searchParams.get("tab") ?? "tiket") as ItLaporanTab
    const filters = parseFilters(searchParams)
    const { page, pageSize } = parsePaginationParams(searchParams)
    const where = buildTiketLaporanWhere(filters)

    const tiket = await prisma.itTiket.findMany({
      where,
      include: {
        kategori: { select: { idKategori: true, nama: true } },
      },
      orderBy: { tglDibuat: "desc" },
    })

    const summary = computeItLaporanSummary(tiket)

    let list: unknown[] = tiket
    if (tab === "kategori") {
      list = aggregateByKategori(tiket)
    } else if (tab === "teknisi") {
      list = aggregateByTeknisi(tiket)
    }

    const paginated = paginateArray(list, page, pageSize)

    return NextResponse.json({ ...paginated, summary, tab })
  } catch (error) {
    console.error("Error fetching IT laporan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
