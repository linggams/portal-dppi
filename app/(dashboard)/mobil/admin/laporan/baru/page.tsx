"use client"

import { MobilLaporanFormPage } from "@/app/(dashboard)/mobil/components/MobilLaporanFormPage"

export default function AdminMobilLaporanBaruPage() {
  return (
    <MobilLaporanFormPage
      listHref="/mobil/admin/laporan"
      detailHrefBase="/mobil/admin/laporan"
    />
  )
}
