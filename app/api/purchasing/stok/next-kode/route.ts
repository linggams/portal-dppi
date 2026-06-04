import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"

/**
 * GET - Generate next available kode barang for a category (idJenis)
 * Format: {idJenis}.{seq} e.g. 1.001, 1.002, 2.001
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const idJenis = searchParams.get("id_jenis")

    if (!idJenis) {
      return NextResponse.json(
        { error: "id_jenis is required" },
        { status: 400 }
      )
    }

    const idJenisNum = parseInt(idJenis)
    if (isNaN(idJenisNum) || idJenisNum < 1) {
      return NextResponse.json(
        { error: "Invalid id_jenis" },
        { status: 400 }
      )
    }

    // Get all stok for this category
    const stokList = await prisma.stokbarang.findMany({
      where: { idJenis: idJenisNum },
      select: { kodeBrg: true },
      orderBy: { kodeBrg: "desc" },
    })

    // Parse kode format: {idJenis}.{seq} e.g. 1.001, 12.005
    const prefix = `${idJenisNum}.`
    let maxSeq = 0

    for (const item of stokList) {
      if (item.kodeBrg.startsWith(prefix)) {
        const seqPart = item.kodeBrg.slice(prefix.length)
        const seq = parseInt(seqPart, 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }

    const nextSeq = maxSeq + 1
    const nextKode = `${idJenisNum}.${String(nextSeq).padStart(3, "0")}`

    return NextResponse.json({ nextKode })
  } catch (error) {
    console.error("Error generating next kode:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
