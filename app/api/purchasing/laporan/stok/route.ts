import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { parsePaginationParams } from "@/lib/shared/pagination"
import {
  attachLaporanKeys,
  paginateByCompleteGroups,
  sortLaporanRows,
} from "@/lib/purchasing/laporan-group"

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { page, pageSize } = parsePaginationParams(
      request.nextUrl.searchParams
    )

    const stok = await prisma.stokbarang.findMany({
      include: { jenisBarang: true },
    })

    const flat = attachLaporanKeys(
      stok as unknown as Record<string, unknown>[],
      "stok"
    )
    sortLaporanRows(flat, "stok", (a, b) =>
      String(a.namaBrg ?? "").localeCompare(String(b.namaBrg ?? ""), "id")
    )

    const totalStok = flat.reduce((sum, item) => sum + Number(item.stok ?? 0), 0)
    const totalSisa = flat.reduce((sum, item) => sum + Number(item.sisa ?? 0), 0)
    const totalKeluar = flat.reduce(
      (sum, item) => sum + Number(item.keluar ?? 0),
      0
    )
    const lowStock = flat.filter((item) => Number(item.sisa) <= 10).length

    const paginated = paginateByCompleteGroups(flat, "stok", page, pageSize)

    return NextResponse.json({
      ...paginated,
      summary: {
        totalStok,
        totalSisa,
        totalKeluar,
        lowStock,
        totalItems: flat.length,
      },
    })
  } catch (error) {
    console.error("Error fetching laporan stok:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
