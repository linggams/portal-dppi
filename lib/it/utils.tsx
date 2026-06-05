import { Badge } from "@/components/ui/badge"
import { IT_TIKET_STATUS_LABEL } from "./constants"

export function getStatusBadge(status: number) {
  const label = IT_TIKET_STATUS_LABEL[status] ?? String(status)
  switch (status) {
    case 0:
      return <Badge variant="outline">{label}</Badge>
    case 1:
      return <Badge variant="secondary">{label}</Badge>
    case 2:
      return <Badge className="bg-blue-600 hover:bg-blue-600">{label}</Badge>
    case 3:
      return <Badge variant="outline" className="border-amber-500 text-amber-700">{label}</Badge>
    case 4:
      return <Badge variant="default">{label}</Badge>
    case 5:
      return <Badge variant="secondary">{label}</Badge>
    case 6:
      return <Badge variant="destructive">{label}</Badge>
    default:
      return <Badge>{label}</Badge>
  }
}

/** Normalisasi pesan riwayat lama yang masih memakai kode angka status. */
export function formatRiwayatPesan(pesan: string): string {
  const match = pesan.match(/^Status diubah menjadi (\d+)$/)
  if (!match) return pesan
  const code = Number(match[1])
  const label = IT_TIKET_STATUS_LABEL[code]
  return label ? `Status diubah menjadi ${label}` : pesan
}

export function formatTiketDate(date: string | Date) {
  try {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return String(date)
  }
}
