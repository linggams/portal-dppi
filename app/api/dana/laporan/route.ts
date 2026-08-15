import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canHandleDanaWorkflow } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { attachKembalian } from "@/lib/dana/hydrate"
import {
  aggregateDanaByJabatan,
  buildDanaLaporanWhere,
  computeDanaLaporanSummary,
  toDanaLaporanRow,
  type DanaLaporanTab,
} from "@/lib/dana/laporan"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleDanaWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tab = (searchParams.get("tab") ?? "daftar") as DanaLaporanTab
    const where = buildDanaLaporanWhere({
      startDate: searchParams.get("start_date"),
      endDate: searchParams.get("end_date"),
      status: searchParams.get("status") ?? "all",
      q: searchParams.get("q"),
      jabatan: searchParams.get("jabatan"),
    })

    const rows = await prisma.danaPengajuan.findMany({
      where,
      orderBy: [{ tglDibuat: "desc" }],
    })
    const hydrated = await attachKembalian(rows)
    const summary = computeDanaLaporanSummary(hydrated)

    const data =
      tab === "jabatan"
        ? aggregateDanaByJabatan(hydrated)
        : hydrated.map(toDanaLaporanRow)

    return NextResponse.json({ data, summary, tab })
  } catch (error) {
    console.error("Error fetching laporan dana:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
