import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSessionFromRequest } from "@/lib/get-session"
import { canManageItTiket } from "@/lib/it/constants"
import {
  aggregateMaintenanceByKategori,
  aggregateMaintenanceByTeknisi,
  computeMaintenanceSummary,
  mergeMaintenanceRows,
  type MaintenanceTab,
} from "@/lib/it/maintenance-shared"
import {
  fetchCompletedTiketRows,
  fetchManualMaintenanceRows,
} from "@/lib/it/maintenance-server"
import { prisma } from "@/lib/db/prisma"

function parseFilters(searchParams: URLSearchParams) {
  return {
    startDate: searchParams.get("start_date"),
    endDate: searchParams.get("end_date"),
    kategoriId: searchParams.get("kategori_id") ?? "all",
    username: searchParams.get("username"),
    sumber: searchParams.get("sumber") ?? "all",
    hasil: searchParams.get("hasil") ?? "all",
    q: searchParams.get("q"),
  }
}

const createSchema = z.object({
  idKategori: z.number().int().positive(),
  tglKerja: z.string().min(1),
  jenisPekerjaan: z
    .enum(["preventif", "korektif", "rutin", "insiden"])
    .optional()
    .nullable(),
  lokasi: z.string().max(100).optional().nullable(),
  judul: z.string().min(1).max(200),
  uraian: z.string().min(1),
  durasiMenit: z.number().int().min(0).optional().nullable(),
  hasil: z.enum(["selesai", "tindak_lanjut"]).default("selesai"),
  idTiket: z.number().int().positive().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const tab = (searchParams.get("tab") ?? "daftar") as MaintenanceTab
    const filters = parseFilters(searchParams)

    const [tiketRows, manualRows] = await Promise.all([
      fetchCompletedTiketRows(filters),
      fetchManualMaintenanceRows(filters),
    ])
    const rows = mergeMaintenanceRows(filters, tiketRows, manualRows)
    const summary = computeMaintenanceSummary(rows)

    let data: unknown = rows
    if (tab === "kategori") {
      data = aggregateMaintenanceByKategori(rows)
    } else if (tab === "teknisi") {
      data = aggregateMaintenanceByTeknisi(rows)
    }

    return NextResponse.json({ data, summary, tab })
  } catch (error) {
    console.error("Error fetching IT maintenance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canManageItTiket(session.user.level)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = createSchema.parse(body)

    const kategori = await prisma.itTiketKategori.findUnique({
      where: { idKategori: data.idKategori },
    })
    if (!kategori?.aktif) {
      return NextResponse.json({ error: "Kategori tidak valid" }, { status: 400 })
    }

    if (data.idTiket) {
      const tiket = await prisma.itTiket.findUnique({
        where: { idTiket: data.idTiket },
      })
      if (!tiket) {
        return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 })
      }
    }

    const created = await prisma.itMaintenanceLog.create({
      data: {
        idKategori: data.idKategori,
        username: session.user.username,
        tglKerja: new Date(data.tglKerja),
        jenisPekerjaan: data.jenisPekerjaan ?? null,
        lokasi: data.lokasi?.trim() || null,
        judul: data.judul.trim(),
        uraian: data.uraian.trim(),
        durasiMenit: data.durasiMenit ?? null,
        hasil: data.hasil,
        idTiket: data.idTiket ?? null,
      },
      include: {
        kategori: { select: { nama: true } },
        tiket: { select: { nomorTiket: true } },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Error creating maintenance log:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
