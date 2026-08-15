import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessMobil,
  canHandleMobilWorkflow,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { toMobilLaporan } from "@/lib/mobil/map"
import { parseJamHm } from "@/lib/mobil/time"
import { deleteMobilBukti, saveMobilBuktiJpg } from "@/lib/mobil/upload"

const includeLaporan = {
  kendaraan: {
    select: {
      idKendaraan: true,
      nopol: true,
      jenis: { select: { nama: true } },
    },
  },
  perjalanan: {
    orderBy: { urutan: "asc" as const },
  },
}

async function rechainKendaraanKm(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  idKendaraan: number
) {
  const kendaraan = await tx.mobilKendaraan.findUnique({
    where: { idKendaraan },
    select: { kmAwal: true },
  })
  if (!kendaraan) return

  const remaining = await tx.mobilLaporanKm.findMany({
    where: { idKendaraan },
    include: { perjalanan: { select: { km: true } } },
    orderBy: [{ tanggal: "asc" }, { idLaporan: "asc" }],
  })

  let cursor = kendaraan.kmAwal
  for (const laporan of remaining) {
    const pemakaian = laporan.perjalanan.reduce((sum, t) => sum + t.km, 0)
    const kmAwal = cursor
    const kmAkhir = cursor + pemakaian
    if (laporan.kmAwal !== kmAwal || laporan.kmAkhir !== kmAkhir) {
      await tx.mobilLaporanKm.update({
        where: { idLaporan: laporan.idLaporan },
        data: { kmAwal, kmAkhir },
      })
    }
    cursor = kmAkhir
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idLaporan = parseInt(id, 10)
    if (!idLaporan || Number.isNaN(idLaporan)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const row = await prisma.mobilLaporanKm.findUnique({
      where: { idLaporan },
      include: includeLaporan,
    })
    if (!row) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json(toMobilLaporan(row))
  } catch (error) {
    console.error("Error fetching mobil laporan detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let uploadedPath: string | null = null
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idLaporan = parseInt(id, 10)
    if (!idLaporan || Number.isNaN(idLaporan)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const existing = await prisma.mobilLaporanKm.findUnique({
      where: { idLaporan },
      include: {
        kendaraan: { select: { nopol: true } },
        perjalanan: { select: { urutan: true }, orderBy: { urutan: "desc" }, take: 1 },
      },
    })
    if (!existing) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    if (
      !canHandleMobilWorkflow(session.user) &&
      existing.username !== session.user.username
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await request.formData()
    const dari = String(form.get("dari") ?? "").trim()
    const ke = String(form.get("ke") ?? "").trim()
    const jamDari = parseJamHm(form.get("jamDari"))
    const jamKe = parseJamHm(form.get("jamKe"))
    const km = Number(form.get("km"))
    const tolRaw = form.get("tol")
    const tol =
      tolRaw === undefined || tolRaw === null || String(tolRaw) === ""
        ? 0
        : Number(tolRaw)

    if (!dari || !ke) {
      return NextResponse.json({ error: "Dari dan ke wajib diisi" }, { status: 400 })
    }
    if (!jamDari || !jamKe) {
      return NextResponse.json(
        { error: "Jam dari dan jam ke wajib (HH:mm)" },
        { status: 400 }
      )
    }
    if (dari.length > 100 || ke.length > 100) {
      return NextResponse.json({ error: "Dari/ke maksimal 100 karakter" }, { status: 400 })
    }
    if (!Number.isInteger(km) || km <= 0) {
      return NextResponse.json({ error: "KM harus bilangan bulat > 0" }, { status: 400 })
    }
    if (!Number.isInteger(tol) || tol < 0) {
      return NextResponse.json({ error: "Tol tidak valid" }, { status: 400 })
    }

    const urutan = (existing.perjalanan[0]?.urutan ?? 0) + 1
    const tanggal = existing.tanggal.toISOString().slice(0, 10)
    const file = form.get("bukti")
    if (file instanceof File && file.size > 0) {
      const uploaded = await saveMobilBuktiJpg(file, {
        nopol: existing.kendaraan.nopol,
        tanggal,
        urutan,
      })
      if (!uploaded.ok) {
        return NextResponse.json({ error: uploaded.error }, { status: 400 })
      }
      uploadedPath = uploaded.relativePath
    }

    try {
      const row = await prisma.$transaction(async (tx) => {
        await tx.mobilLaporanPerjalanan.create({
          data: {
            idLaporan,
            urutan,
            dari,
            jamDari,
            ke,
            jamKe,
            km,
            tol,
            buktiPath: uploadedPath,
          },
        })

        await rechainKendaraanKm(tx, existing.idKendaraan)

        return tx.mobilLaporanKm.findUniqueOrThrow({
          where: { idLaporan },
          include: includeLaporan,
        })
      })

      return NextResponse.json(toMobilLaporan(row), { status: 201 })
    } catch (error) {
      if (uploadedPath) await deleteMobilBukti(uploadedPath)
      throw error
    }
  } catch (error) {
    console.error("Error adding mobil perjalanan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canHandleMobilWorkflow(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const idLaporan = parseInt(id, 10)
    if (!idLaporan || Number.isNaN(idLaporan)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const row = await prisma.mobilLaporanKm.findUnique({
      where: { idLaporan },
      include: { perjalanan: { select: { buktiPath: true } } },
    })
    if (!row) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 })
    }

    for (const trip of row.perjalanan) {
      await deleteMobilBukti(trip.buktiPath)
    }

    const idKendaraan = row.idKendaraan

    await prisma.$transaction(async (tx) => {
      await tx.mobilLaporanKm.delete({ where: { idLaporan } })
      await rechainKendaraanKm(tx, idKendaraan)
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting mobil laporan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
