"use client"

import { MobilLaporanFormPage } from "@/app/(dashboard)/mobil/components/MobilLaporanFormPage"

export default function MobilUserLaporanBaruPage() {
  return (
    <MobilLaporanFormPage
      listHref="/mobil/user/laporan"
      detailHrefBase="/mobil/user/laporan"
    />
  )
}
