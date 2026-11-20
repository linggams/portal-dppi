"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/shared/makepdf"
import { COMPANY_LEGAL_NAME, companyPdfHeader } from "@/lib/shared/app-branding"
import { formatDateId } from "@/lib/shared/date"
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
      toast.error("Failed to load request data")
    } finally {
      setLoading(false)
    }
  }, [selectedDate, session?.user?.username])

  useEffect(() => {
    if (selectedDate && session?.user?.username) {
      fetchPermintaan()
    }
  }, [selectedDate, session?.user?.username, fetchPermintaan])

  const formatDate = useCallback(
    (dateString: string) => formatDateId(dateString, dateString),
    []
  )

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
          toast.error("No data to download")
          return
        }

        const filename = `BPP_${date}_${items[0]?.instansi || "unknown"}.pdf`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const docDefinition: any = {
          pageSize: "A4",
          pageOrientation: "portrait",
          pageMargins: [40, 60, 40, 40],
          content: [
            ...companyPdfHeader({ lineWidth: 515, afterLine: 10 }),
            { text: "GOODS REQUEST RECEIPT (BPP)", style: "title", alignment: "center", margin: [0, 0, 0, 12] },
            {
              columns: [
                {
                  width: "*",
                  stack: [
                    { text: "Unit:", style: "label" },
                    { text: items[0]?.unit ?? "", style: "value" },
                    { text: "Date:", style: "label", margin: [0, 8, 0, 0] },
                    { text: formatDate(date), style: "value" },
                  ],
                },
                {
                  width: "*",
                  stack: [
                    { text: "Department:", style: "label" },
                    { text: items[0]?.instansi ?? "", style: "value" },
                    { text: "Status:", style: "label", margin: [0, 8, 0, 0] },
                    { text: "Approved", style: "value" },
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
                    { text: "Item name", style: "tableHeader" },
                    { text: "Qty", style: "tableHeader" },
                    { text: "Unit", style: "tableHeader" },
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
                    { text: "Requester,", style: "signTitle", margin: [0, 18, 0, 30] },
                    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                    { text: session?.user?.jabatan ?? "", style: "signMeta", margin: [0, 6, 0, 0] },
                    { text: session?.user?.username ?? "", style: "signName", margin: [0, 30, 0, 0] },
                  ],
                },
                {
                  width: "*",
                  stack: [
                    { text: "Acknowledged by,", style: "signTitle", margin: [0, 18, 0, 30] },
                    { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                    { text: "Admin", style: "signMeta", margin: [0, 6, 0, 0] },
                    { text: COMPANY_LEGAL_NAME, style: "signName", margin: [0, 30, 0, 0] },
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
        toast.success("PDF downloaded successfully")
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast.error("Failed to download PDF")
      }
    },
    []
  )

  const handleExportAllPDF = useCallback(async () => {
    const dates = Object.keys(groupedPermintaan)
    if (dates.length === 0) {
      toast.error("No data to export")
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
          ...companyPdfHeader({ lineWidth: 515, afterLine: 10 }),
          { text: "GOODS REQUEST RECEIPT (BPP)", style: "title", alignment: "center", margin: [0, 0, 0, 12] },
          {
            columns: [
              {
                width: "*",
                stack: [
                  { text: "Unit:", style: "label" },
                  { text: items[0]?.unit ?? "", style: "value" },
                  { text: "Date:", style: "label", margin: [0, 8, 0, 0] },
                  { text: formatDate(date), style: "value" },
                ],
              },
              {
                width: "*",
                stack: [
                  { text: "Department:", style: "label" },
                  { text: items[0]?.instansi ?? "", style: "value" },
                  { text: "Status:", style: "label", margin: [0, 8, 0, 0] },
                  { text: "Approved", style: "value" },
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
                  { text: "Item name", style: "tableHeader" },
                  { text: "Qty", style: "tableHeader" },
                  { text: "Unit", style: "tableHeader" },
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
                  { text: "Requester,", style: "signTitle", margin: [0, 18, 0, 30] },
                  { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: session?.user?.jabatan ?? "", style: "signMeta", margin: [0, 6, 0, 0] },
                  { text: session?.user?.username ?? "", style: "signName", margin: [0, 30, 0, 0] },
                ],
              },
              {
                width: "*",
                stack: [
                  { text: "Acknowledged by,", style: "signTitle", margin: [0, 18, 0, 30] },
                  { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                  { text: "Admin", style: "signMeta", margin: [0, 6, 0, 0] },
                  { text: COMPANY_LEGAL_NAME, style: "signName", margin: [0, 30, 0, 0] },
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
      toast.success("PDF exported successfully")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Failed to export PDF")
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
