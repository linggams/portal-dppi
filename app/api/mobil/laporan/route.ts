import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import {
  canAccessMobil,
  canHandleMobilWorkflow,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import { parseDateOnly, toMobilLaporan } from "@/lib/mobil/map"
import { deleteMobilBukti, saveMobilBuktiJpg } from "@/lib/mobil/upload"

const includeLaporan = {
  kendaraan: {
    select: {
      idKendaraan: true,
      nopol: true,
      jenis: { select: { nama: true } },
    },
  },
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const mine = params.get("mine") === "true"
    const idKendaraan = params.get("id_kendaraan")
    const startDate = params.get("start_date")
    const endDate = params.get("end_date")
    const q = params.get("q")?.trim() ?? ""

    const where: {
      username?: string
      idKendaraan?: number
      tanggal?: { gte?: Date; lte?: Date }
      OR?: Array<
        | { username: { contains: string; mode: "insensitive" } }
        | { keterangan: { contains: string; mode: "insensitive" } }
        | { kendaraan: { nopol: { contains: string; mode: "insensitive" } } }
      >
    } = {}

    if (!canHandleMobilWorkflow(session.user) || mine) {
      where.username = session.user.username
    }

    if (idKendaraan) {
      const parsed = parseInt(idKendaraan, 10)
      if (!Number.isNaN(parsed)) where.idKendaraan = parsed
    }

    if (startDate || endDate) {
      where.tanggal = {}
      if (startDate) {
        const d = parseDateOnly(startDate)
        if (d) where.tanggal.gte = d
      }
      if (endDate) {
        const d = parseDateOnly(endDate)
        if (d) where.tanggal.lte = d
      }
    }

    if (q) {
      where.OR = [
        { username: { contains: q, mode: "insensitive" } },
        { keterangan: { contains: q, mode: "insensitive" } },
        { kendaraan: { nopol: { contains: q, mode: "insensitive" } } },
      ]
    }

    const rows = await prisma.mobilLaporanKm.findMany({
      where,
      include: includeLaporan,
      orderBy: [{ tanggal: "desc" }, { idLaporan: "desc" }],
    })

    return NextResponse.json(rows.map(toMobilLaporan))
  } catch (error) {
    console.error("Error fetching mobil laporan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const idKendaraan = parseInt(String(form.get("idKendaraan") ?? ""), 10)
    const tanggalRaw = String(form.get("tanggal") ?? "")
    const kmAkhir = parseInt(String(form.get("kmAkhir") ?? ""), 10)
    const keterangan = String(form.get("keterangan") ?? "").trim()
    const file = form.get("bukti")

    if (!idKendaraan || Number.isNaN(idKendaraan)) {
      return NextResponse.json({ error: "Kendaraan wajib dipilih" }, { status: 400 })
    }
    const tanggal = parseDateOnly(tanggalRaw)
    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 })
    }
    if (Number.isNaN(kmAkhir) || kmAkhir < 0) {
      return NextResponse.json({ error: "KM akhir tidak valid" }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Bukti foto wajib dilampirkan" },
        { status: 400 }
      )
    }

    const kendaraan = await prisma.mobilKendaraan.findUnique({
      where: { idKendaraan },
    })
    if (!kendaraan || !kendaraan.aktif) {
      return NextResponse.json(
        { error: "Kendaraan tidak ditemukan / tidak aktif" },
        { status: 400 }
      )
    }

    const last = await prisma.mobilLaporanKm.findFirst({
      where: { idKendaraan },
      orderBy: [{ tanggal: "desc" }, { idLaporan: "desc" }],
    })
    const kmAwal = last?.kmAkhir ?? kendaraan.kmAwal
    if (kmAkhir < kmAwal) {
      return NextResponse.json(
        { error: `KM akhir tidak boleh kurang dari KM awal (${kmAwal})` },
        { status: 400 }
      )
    }

    const duplicate = await prisma.mobilLaporanKm.findUnique({
      where: {
        idKendaraan_tanggal: { idKendaraan, tanggal },
      },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: "Laporan untuk tanggal ini sudah ada" },
        { status: 400 }
      )
    }

    const uploaded = await saveMobilBuktiJpg(file, {
      nopol: kendaraan.nopol,
      tanggal: tanggalRaw,
    })
    if (!uploaded.ok) {
      return NextResponse.json({ error: uploaded.error }, { status: 400 })
    }

    try {
      const row = await prisma.mobilLaporanKm.create({
        data: {
          idKendaraan,
          username: session.user.username,
          jabatan: session.user.jabatan,
          tanggal,
          kmAwal,
          kmAkhir,
          keterangan,
          buktiPath: uploaded.relativePath,
        },
        include: includeLaporan,
      })
      return NextResponse.json(toMobilLaporan(row), { status: 201 })
    } catch (error) {
      await deleteMobilBukti(uploaded.relativePath)
      throw error
    }
  } catch (error) {
    console.error("Error creating mobil laporan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
