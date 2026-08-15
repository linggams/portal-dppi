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
  perjalanan: {
    orderBy: { urutan: "asc" as const },
  },
}

type TripInput = { dari: string; ke: string; km: number; tol: number }

function parsePerjalanan(raw: string): TripInput[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    const trips: TripInput[] = []
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null
      const dari = String((item as { dari?: unknown }).dari ?? "").trim()
      const ke = String((item as { ke?: unknown }).ke ?? "").trim()
      const km = Number((item as { km?: unknown }).km)
      const tolRaw = (item as { tol?: unknown }).tol
      const tol = tolRaw === undefined || tolRaw === null || tolRaw === ""
        ? 0
        : Number(tolRaw)
      if (!dari || !ke || !Number.isInteger(km) || km <= 0) return null
      if (!Number.isInteger(tol) || tol < 0) return null
      if (dari.length > 100 || ke.length > 100) return null
      trips.push({ dari, ke, km, tol })
    }
    return trips
  } catch {
    return null
  }
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
  const uploadedPaths: string[] = []
  try {
    const session = await getSessionFromRequest(request)
    if (!session || !canAccessMobil(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const idKendaraan = parseInt(String(form.get("idKendaraan") ?? ""), 10)
    const tanggalRaw = String(form.get("tanggal") ?? "")
    const trips = parsePerjalanan(String(form.get("perjalanan") ?? ""))

    if (!idKendaraan || Number.isNaN(idKendaraan)) {
      return NextResponse.json({ error: "Kendaraan wajib dipilih" }, { status: 400 })
    }
    const tanggal = parseDateOnly(tanggalRaw)
    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 })
    }
    if (!trips) {
      return NextResponse.json(
        { error: "Minimal satu perjalanan (dari, ke, km > 0)" },
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
    const totalKm = trips.reduce((sum, t) => sum + t.km, 0)
    const kmAkhir = kmAwal + totalKm

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

    const buktiPaths: Array<string | null> = []
    for (let i = 0; i < trips.length; i++) {
      const file = form.get(`bukti_${i}`)
      if (!(file instanceof File) || file.size <= 0) {
        buktiPaths.push(null)
        continue
      }
      const uploaded = await saveMobilBuktiJpg(file, {
        nopol: kendaraan.nopol,
        tanggal: tanggalRaw,
        urutan: i + 1,
      })
      if (!uploaded.ok) {
        for (const p of uploadedPaths) await deleteMobilBukti(p)
        return NextResponse.json(
          { error: `Perjalanan #${i + 1}: ${uploaded.error}` },
          { status: 400 }
        )
      }
      uploadedPaths.push(uploaded.relativePath)
      buktiPaths.push(uploaded.relativePath)
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
          perjalanan: {
            create: trips.map((trip, index) => ({
              urutan: index + 1,
              dari: trip.dari,
              ke: trip.ke,
              km: trip.km,
              tol: trip.tol,
              buktiPath: buktiPaths[index],
            })),
          },
        },
        include: includeLaporan,
      })
      return NextResponse.json(toMobilLaporan(row), { status: 201 })
    } catch (error) {
      for (const p of uploadedPaths) await deleteMobilBukti(p)
      throw error
    }
  } catch (error) {
    console.error("Error creating mobil laporan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
