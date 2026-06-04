export function formatRupiah(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num)
}
