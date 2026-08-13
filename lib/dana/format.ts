const SATUAN = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
]

function tigaDigit(n: number): string {
  const ratus = Math.floor(n / 100)
  const puluh = Math.floor((n % 100) / 10)
  const satuan = n % 10
  const parts: string[] = []

  if (ratus === 1) parts.push("seratus")
  else if (ratus > 1) parts.push(`${SATUAN[ratus]} ratus`)

  if (puluh === 1) {
    if (satuan === 0) parts.push("sepuluh")
    else if (satuan === 1) parts.push("sebelas")
    else parts.push(`${SATUAN[satuan]} belas`)
  } else {
    if (puluh > 1) parts.push(`${SATUAN[puluh]} puluh`)
    if (satuan > 0) parts.push(SATUAN[satuan])
  }

  return parts.join(" ")
}

export function terbilang(value: number): string {
  if (!Number.isFinite(value) || value < 0) return ""
  if (value === 0) return "nol"

  const miliar = Math.floor(value / 1_000_000_000)
  const juta = Math.floor((value % 1_000_000_000) / 1_000_000)
  const ribu = Math.floor((value % 1_000_000) / 1000)
  const sisa = value % 1000
  const parts: string[] = []

  if (miliar > 0) parts.push(`${tigaDigit(miliar)} miliar`)
  if (juta > 0) parts.push(`${tigaDigit(juta)} juta`)
  if (ribu === 1 && miliar === 0 && juta === 0) parts.push("seribu")
  else if (ribu > 0) parts.push(`${tigaDigit(ribu)} ribu`)
  if (sisa > 0) parts.push(tigaDigit(sisa))

  return parts.join(" ").replace(/\s+/g, " ").trim()
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function capitalize(text: string) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function parseRupiahInput(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return 0
  return Number.parseInt(digits, 10)
}

export function formatDanaDate(date: string | Date) {
  try {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return String(date)
  }
}

export function formatDanaDateOnly(date: string | Date) {
  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return String(date)
  }
}
