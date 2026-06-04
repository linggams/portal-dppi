"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { downloadPdf } from "@/lib/makepdf"
import type { Permintaan } from "../types"

export function useCetakBPP() {
  const { data: session } = useSession()
  const [permintaan, setPermintaan] = useState<Permintaan[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const fetchPermintaan = useCallback(async () => {
    if (!session?.user?.username) return
    setLoading(true)
    try {
      const response = await fetch(
        `/api/purchasing/permintaan?unit=${session.user.username}&tgl_permintaan=${selectedDate}&status=1`
      )
      if (response.ok) {
        const data = await response.json()
        setPermintaan(data)
      }
    } catch {
      toast.error("Gagal memuat data permintaan")
    } finally {
      setLoading(false)
    }
  }, [selectedDate, session?.user?.username])

  useEffect(() => {
    if (selectedDate && session?.user?.username) {
      fetchPermintaan()
    }
  }, [selectedDate, session?.user?.username, fetchPermintaan])

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
    } catch {
      return dateString
    }
  }, [])

  const groupedPermintaan = permintaan.reduce((acc, item) => {
    const date = item.tglPermintaan.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, Permintaan[]>)

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(
    async (date: string, items: Permintaan[]) => {
      try {
        if (!items.length) {
          toast.error("Tidak ada data untuk diunduh")
          return
        }

        const filename = `BPP_${date}_${items[0]?.instansi || "unknown"}.pdf`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const docDefinition: any = {
          pageSize: "A4",
          pageOrientation: "portrait",
          pageMargins: [40, 60, 40, 40],
          content: [
            { text: "PT DASAN PAN PACIFIC INDONESIA", style: "header", alignment: "center" },
            {
              text: "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355",
              style: "subheader",
              alignment: "center",
              margin: [0, 4, 0, 8],
            },
            { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 10] },
            { text: "BUKTI PERMINTAAN BARANG (BPP)", style: "title", alignment: "center", margin: [0, 0, 0, 12] },
            {
              columns: [
                {
                  width: "*",
                  stack: [
                    { text: "Unit:", style: "label" },
                    { text: items[0]?.unit ?? "", style: "value" },
                    { text: "Tanggal:", style: "label", margin: [0, 8, 0, 0] },
                    { text: formatDate(date), style: "value" },
                  ],
                },
                {
                  width: "*",
                  stack: [
                    { text: "Departemen:", style: "label" },
                    { text: items[0]?.instansi ?? "", style: "value" },
                    { text: "Status:", style: "label", margin: [0, 8, 0, 0] },
                    { text: "Disetujui", style: "value" },
                  ],
                },
              ],
              margin: [0, 0, 0, 12],
            },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto"],
                body: [
                  [
                    { text: "No", style: "tableHeader" },
                    { text: "Nama Barang", style: "tableHeader" },
                    { text: "Jumlah", style: "tableHeader" },
                    { text: "Satuan", style: "tableHeader" },
                  ],
                  ...items.map((item, index) => [
                    { text: String(index + 1), alignment: "center" },
                    { text: item.stokbarang?.namaBrg ?? "" },
                    { text: String(item.jumlah ?? ""), alignment: "center" },
                    { text: item.stokbarang?.satuan ?? "", alignment: "center" },
                  ]),
                ],
              },
              layout: "lightHorizontalLines",
            },
            {
              columns: [
                {
                  width: "*",
                  stack: [
                    { text: "Yang Meminta,", style: "signTitle", margin: [0, 18, 0, 30] },
                    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                    { text: session?.user?.jabatan ?? "", style: "signMeta", margin: [0, 6, 0, 0] },
                    { text: session?.user?.username ?? "", style: "signName", margin: [0, 30, 0, 0] },
                  ],
                },
                {
                  width: "*",
                  stack: [
                    { text: "Mengetahui,", style: "signTitle", margin: [0, 18, 0, 30] },
                    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                    { text: "Admin", style: "signMeta", margin: [0, 6, 0, 0] },
                    { text: "PT DASAN PAN PACIFIC INDONESIA", style: "signName", margin: [0, 30, 0, 0] },
                  ],
                },
              ],
            },
          ],
          styles: {
            header: { fontSize: 14, bold: true },
            subheader: { fontSize: 9 },
            title: { fontSize: 12, bold: true },
            label: { fontSize: 10, bold: true },
            value: { fontSize: 10 },
            tableHeader: { bold: true, fontSize: 9, fillColor: "#f3f4f6", alignment: "center" },
            signTitle: { fontSize: 10, bold: true },
            signMeta: { fontSize: 10 },
            signName: { fontSize: 9, color: "#6b7280" },
          },
          defaultStyle: { fontSize: 9 },
        }

        downloadPdf(docDefinition, filename)
        toast.success("PDF berhasil diunduh")
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast.error("Gagal mengunduh PDF")
      }
    },
    []
  )

  const handleExportAllPDF = useCallback(async () => {
    const dates = Object.keys(groupedPermintaan)
    if (dates.length === 0) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }
    try {
      const filename = `BPP_${selectedDate}_${session?.user?.username || "export"}.pdf`

      const content: any[] = []
      dates.forEach((date, idx) => {
        const items = groupedPermintaan[date] || []
        if (items.length === 0) return

        if (idx > 0) content.push({ text: "", pageBreak: "before" })

        content.push(
          { text: "PT DASAN PAN PACIFIC INDONESIA", style: "header", alignment: "center" },
          {
            text: "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355",
            style: "subheader",
            alignment: "center",
            margin: [0, 4, 0, 8],
          },
          { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 10] },
          { text: "BUKTI PERMINTAAN BARANG (BPP)", style: "title", alignment: "center", margin: [0, 0, 0, 12] },
          {
            columns: [
              {
                width: "*",
                stack: [
                  { text: "Unit:", style: "label" },
                  { text: items[0]?.unit ?? "", style: "value" },
                  { text: "Tanggal:", style: "label", margin: [0, 8, 0, 0] },
                  { text: formatDate(date), style: "value" },
                ],
              },
              {
                width: "*",
                stack: [
                  { text: "Departemen:", style: "label" },
                  { text: items[0]?.instansi ?? "", style: "value" },
                  { text: "Status:", style: "label", margin: [0, 8, 0, 0] },
                  { text: "Disetujui", style: "value" },
                ],
              },
            ],
            margin: [0, 0, 0, 12],
          },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "*", "auto", "auto"],
              body: [
                [
                  { text: "No", style: "tableHeader" },
                  { text: "Nama Barang", style: "tableHeader" },
                  { text: "Jumlah", style: "tableHeader" },
                  { text: "Satuan", style: "tableHeader" },
                ],
                ...items.map((item, index) => [
                  { text: String(index + 1), alignment: "center" },
                  { text: item.stokbarang?.namaBrg ?? "" },
                  { text: String(item.jumlah ?? ""), alignment: "center" },
                  { text: item.stokbarang?.satuan ?? "", alignment: "center" },
                ]),
              ],
            },
            layout: "lightHorizontalLines",
          },
          {
            columns: [
              {
                width: "*",
                stack: [
                  { text: "Yang Meminta,", style: "signTitle", margin: [0, 18, 0, 30] },
                  { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: session?.user?.jabatan ?? "", style: "signMeta", margin: [0, 6, 0, 0] },
                  { text: session?.user?.username ?? "", style: "signName", margin: [0, 30, 0, 0] },
                ],
              },
              {
                width: "*",
                stack: [
                  { text: "Mengetahui,", style: "signTitle", margin: [0, 18, 0, 30] },
                  { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: "Admin", style: "signMeta", margin: [0, 6, 0, 0] },
                  { text: "PT DASAN PAN PACIFIC INDONESIA", style: "signName", margin: [0, 30, 0, 0] },
                ],
              },
            ],
          }
        )
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docDefinition: any = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [40, 60, 40, 40],
        content,
        styles: {
          header: { fontSize: 14, bold: true },
          subheader: { fontSize: 9 },
          title: { fontSize: 12, bold: true },
          label: { fontSize: 10, bold: true },
          value: { fontSize: 10 },
          tableHeader: { bold: true, fontSize: 9, fillColor: "#f3f4f6", alignment: "center" },
          signTitle: { fontSize: 10, bold: true },
          signMeta: { fontSize: 10 },
          signName: { fontSize: 9, color: "#6b7280" },
        },
        defaultStyle: { fontSize: 9 },
      }

      downloadPdf(docDefinition, filename)
      toast.success("PDF berhasil diekspor")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Gagal mengekspor PDF")
    }
  }, [groupedPermintaan, selectedDate, session?.user?.jabatan, session?.user?.username, formatDate])

  return {
    selectedDate,
    setSelectedDate,
    loading,
    groupedPermintaan,
    fetchPermintaan,
    formatDate,
    handlePrint,
    handleDownloadPDF,
    handleExportAllPDF,
    session,
  }
}
