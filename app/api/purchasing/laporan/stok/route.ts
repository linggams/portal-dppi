import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  paginateArray,
  parsePaginationParams,
} from "@/lib/shared/pagination"
import { sortByKategoriThen } from "@/lib/purchasing/laporan-group"

// GET - Laporan stok (only for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { page, pageSize } = parsePaginationParams(
      request.nextUrl.searchParams
    )

    const stok = await prisma.stokbarang.findMany({
      include: { jenisBarang: true },
    })

    sortByKategoriThen(stok, "stok", (a, b) =>
      a.namaBrg.localeCompare(b.namaBrg, "id")
    )

    const totalStok = stok.reduce((sum: number, item) => sum + item.stok, 0)
    const totalSisa = stok.reduce((sum: number, item) => sum + item.sisa, 0)
    const totalKeluar = stok.reduce(
      (sum: number, item) => sum + item.keluar,
      0
    )
    const lowStock = stok.filter((item) => item.sisa <= 10).length

    const paginated = paginateArray(stok, page, pageSize)

    return NextResponse.json({
      ...paginated,
      summary: {
        totalStok,
        totalSisa,
        totalKeluar,
        lowStock,
        totalItems: stok.length,
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
