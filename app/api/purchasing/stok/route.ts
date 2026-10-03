import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  paginateArray,
  parsePaginationParams,
  toPaginatedResult,
  wantsPagination,
} from "@/lib/shared/pagination"
import { z } from "zod"

const stokSortFields = ["stok", "keluar", "sisa", "hargabarang"] as const

type StokSortField = (typeof stokSortFields)[number]

function parseHarga(value: string) {
  const digits = value.replace(/[^\d]/g, "")
  return digits ? Number(digits) : 0
}

function sortStokRows<T extends { stok: number; keluar: number; sisa: number; hargabarang: string }>(
  rows: T[],
  sort: StokSortField,
  dir: "asc" | "desc"
) {
  const factor = dir === "asc" ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = sort === "hargabarang" ? parseHarga(a.hargabarang) : a[sort]
    const right = sort === "hargabarang" ? parseHarga(b.hargabarang) : b[sort]
    return (left - right) * factor
  })
}

function readStokSort(value: string | null): StokSortField | null {
  if (value && stokSortFields.includes(value as StokSortField)) {
    return value as StokSortField
  }
  return null
}

const stokSchema = z.object({
  kodeBrg: z.string().min(1).max(7),
  idJenis: z.number().int(),
  namaBrg: z.string().min(1).max(50),
  hargabarang: z.string().min(1).max(50),
  satuan: z.string().min(1).max(50),
  stok: z.number().int().default(0),
  keterangan: z.string().max(50).default(""),
})

// GET - List stok barang. Tanpa `page` mengembalikan semua baris (untuk select).
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const idJenis = searchParams.get("id_jenis")
    const sort = readStokSort(searchParams.get("sort"))
    const sortDir = searchParams.get("dir") === "asc" ? "asc" : "desc"

    const where: { idJenis?: number } = {}
    if (idJenis) {
      where.idJenis = parseInt(idJenis)
    }

    if (wantsPagination(searchParams)) {
      const { page, pageSize, skip } = parsePaginationParams(searchParams)
      if (sort) {
        const rows = await prisma.stokbarang.findMany({ where })
        const sorted = sortStokRows(rows, sort, sortDir)
        return NextResponse.json(paginateArray(sorted, page, pageSize))
      }

      const [total, stokBarang] = await Promise.all([
        prisma.stokbarang.count({ where }),
        prisma.stokbarang.findMany({
          where,
          orderBy: { kodeBrg: "asc" },
          skip,
          take: pageSize,
        }),
      ])

      return NextResponse.json(
        toPaginatedResult(stokBarang, total, page, pageSize)
      )
    }

    const stokBarang = await prisma.stokbarang.findMany({
      where,
      orderBy: { kodeBrg: "asc" },
    })

    return NextResponse.json(stokBarang)
  } catch (error) {
    console.error("Error fetching stok barang:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new stok barang (only for admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canManagePurchasingMaster(session.user)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = stokSchema.parse(body)

    // Check if kode_brg already exists
    const existingStok = await prisma.stokbarang.findUnique({
      where: { kodeBrg: validatedData.kodeBrg },
    })

    if (existingStok) {
      return NextResponse.json(
        { error: "Kode barang sudah ada" },
        { status: 400 }
      )
    }

    const stokBarang = await prisma.stokbarang.create({
      data: {
        kodeBrg: validatedData.kodeBrg,
        idJenis: validatedData.idJenis,
        namaBrg: validatedData.namaBrg,
        hargabarang: validatedData.hargabarang,
        satuan: validatedData.satuan,
        stok: validatedData.stok,
        keluar: 0,
        sisa: validatedData.stok,
        keterangan: validatedData.keterangan,
      },
    })

    return NextResponse.json(stokBarang, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating stok barang:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
