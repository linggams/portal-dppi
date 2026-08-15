"use client"

import { MobilLaporanDetailPage } from "../../../components/MobilLaporanDetailPage"

export default function UserMobilLaporanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <MobilLaporanDetailPage
      params={params}
      backHref="/mobil/user/laporan"
      title="Detail Laporan"
    />
  )
}
