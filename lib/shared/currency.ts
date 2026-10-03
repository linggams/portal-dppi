export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function parseRupiahInput(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return 0
  return Number.parseInt(digits, 10)
}
