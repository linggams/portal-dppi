import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManagePurchasingMaster } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { z } from "zod"

const updateStokSchema = z.object({
  kodeBrg: z.string().min(1).max(7).optional(),
  idJenis: z.number().int().optional(),
  namaBrg: z.string().min(1).max(50).optional(),
  hargabarang: z.string().min(1).max(50).optional(),
  satuan: z.string().min(1).max(50).optional(),
  stok: z.number().int().optional(),
  keterangan: z.string().max(50).optional(),
})

// GET - Get single stok barang
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stokBarang = await prisma.stokbarang.findUnique({
      where: { idKodeBrg: parseInt(id) },
    })

    if (!stokBarang) {
      return NextResponse.json(
        { error: "Stok barang not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(stokBarang)
  } catch (error) {
    console.error("Error fetching stok barang:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update stok barang (only for admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canManagePurchasingMaster(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateStokSchema.parse(body)

    // Check if stok barang exists
    const existingStok = await prisma.stokbarang.findUnique({
      where: { idKodeBrg: parseInt(id) },
    })

    if (!existingStok) {
      return NextResponse.json(
        { error: "Stok barang not found" },
        { status: 404 }
      )
    }

    // Check if kode_brg is being changed and if it's already taken
    if (validatedData.kodeBrg && validatedData.kodeBrg !== existingStok.kodeBrg) {
      const kodeTaken = await prisma.stokbarang.findUnique({
        where: { kodeBrg: validatedData.kodeBrg },
      })

      if (kodeTaken) {
        return NextResponse.json(
          { error: "Kode barang sudah ada" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.kodeBrg) updateData.kodeBrg = validatedData.kodeBrg
    if (validatedData.idJenis !== undefined) updateData.idJenis = validatedData.idJenis
    if (validatedData.namaBrg) updateData.namaBrg = validatedData.namaBrg
    if (validatedData.hargabarang) updateData.hargabarang = validatedData.hargabarang
    if (validatedData.satuan) updateData.satuan = validatedData.satuan
    if (validatedData.stok !== undefined) {
      updateData.stok = validatedData.stok
      // Recalculate sisa
      updateData.sisa = validatedData.stok - existingStok.keluar
    }
    if (validatedData.keterangan !== undefined) updateData.keterangan = validatedData.keterangan

    const stokBarang = await prisma.stokbarang.update({
      where: { idKodeBrg: parseInt(id) },
      data: updateData,
    })

    return NextResponse.json(stokBarang)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating stok barang:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete stok barang (only for admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canManagePurchasingMaster(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.stokbarang.delete({
      where: { idKodeBrg: parseInt(id) },
    })

    return NextResponse.json({ message: "Stok barang deleted successfully" })
  } catch (error) {
    console.error("Error deleting stok barang:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
