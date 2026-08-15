import { mkdir, writeFile, unlink } from "fs/promises"
import path from "path"
import { MOBIL_BUKTI_MAX_BYTES } from "./upload-limits"

const MOBIL_BUKTI_DIR = path.join(process.cwd(), "public", "uploads", "mobil")

function isJpeg(buffer: Buffer) {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  )
}

/** Nopol aman untuk nama file, contoh: "B 1234 XYZ" → "B1234XYZ" */
function slugNopol(nopol: string) {
  const slug = nopol
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 20)
  return slug || "NOPOL"
}

function buildBuktiFilename(nopol: string, tanggal: string, urutan: number) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(tanggal)
    ? tanggal
    : new Date().toISOString().slice(0, 10)
  return `${slugNopol(nopol)}_${date}_${urutan}.jpg`
}

export async function saveMobilBuktiJpg(
  file: File,
  meta: { nopol: string; tanggal: string; urutan: number }
): Promise<{ ok: true; relativePath: string } | { ok: false; error: string }> {
  if (!file || file.size <= 0) {
    return { ok: false, error: "Bukti foto wajib dilampirkan" }
  }

  if (file.size > MOBIL_BUKTI_MAX_BYTES) {
    return { ok: false, error: "Ukuran foto maksimal 2 MB" }
  }

  const type = (file.type || "").toLowerCase()
  const name = (file.name || "").toLowerCase()
  const looksJpg =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  if (!looksJpg) {
    return { ok: false, error: "File harus berformat JPG" }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (!isJpeg(buffer)) {
    return { ok: false, error: "File harus berformat JPG" }
  }

  await mkdir(MOBIL_BUKTI_DIR, { recursive: true })
  const filename = buildBuktiFilename(meta.nopol, meta.tanggal, meta.urutan)
  await writeFile(path.join(MOBIL_BUKTI_DIR, filename), buffer)

  return { ok: true, relativePath: `/uploads/mobil/${filename}` }
}

export async function deleteMobilBukti(relativePath: string | null | undefined) {
  if (!relativePath || !relativePath.startsWith("/uploads/mobil/")) return
  const filename = path.basename(relativePath)
  try {
    await unlink(path.join(MOBIL_BUKTI_DIR, filename))
  } catch {
    /* ignore missing file */
  }
}
