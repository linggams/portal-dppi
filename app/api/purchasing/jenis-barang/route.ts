import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import {
  parsePaginationParams,
  toPaginatedResult,
  wantsPagination,
} from "@/lib/shared/pagination"
import { z } from "zod"

const kategoriSchema = z.object({
  jenisBrg: z.string().min(1).max(255),
})

// GET - List all kategori (accessible by all authenticated users)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    // Allow all authenticated users to view kategori (for sidebar)
    // Only restrict write operations to admin
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams

    if (wantsPagination(searchParams)) {
      const { page, pageSize, skip } = parsePaginationParams(searchParams)
      const [total, kategori] = await Promise.all([
        prisma.jenisBarang.count(),
        prisma.jenisBarang.findMany({
          orderBy: { idJenis: "asc" },
          skip,
          take: pageSize,
        }),
      ])
      return NextResponse.json(
        toPaginatedResult(kategori, total, page, pageSize)
      )
    }

    const kategori = await prisma.jenisBarang.findMany({
      orderBy: {
        idJenis: "asc",
      },
    })

    return NextResponse.json(kategori)
  } catch (error) {
    console.error("Error fetching kategori:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new kategori
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
    const validatedData = kategoriSchema.parse(body)

    const kategori = await prisma.jenisBarang.create({
      data: { jenisBrg: validatedData.jenisBrg },
    })

    return NextResponse.json(kategori, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating kategori:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
