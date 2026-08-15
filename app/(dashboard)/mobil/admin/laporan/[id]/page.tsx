"use client"

import { MobilLaporanDetailPage } from "../../../components/MobilLaporanDetailPage"

export default function AdminMobilLaporanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <MobilLaporanDetailPage
      params={params}
      backHref="/mobil/admin/laporan"
      title="Detail Laporan KM"
    />
  )
}
