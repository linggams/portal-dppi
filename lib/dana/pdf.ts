import { toast } from "sonner"
import { downloadPdf } from "@/lib/makepdf"
import { danaTerpakai, DANA_STATUS } from "./constants"
import type { DanaPengajuan } from "./dana-types"
import { capitalize, formatDanaDate, formatRupiah, terbilang } from "./format"

/** Slip landscape: ukuran kertas = ukuran border (tanpa margin kosong di luar). */
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 248
const BOX_PADDING = 12
const CONTENT_WIDTH = PAGE_WIDTH - BOX_PADDING * 2
const RIGHT_COLUMN_WIDTH = 215
const SIGN_LINE_WIDTH = 88
const BORDER_WIDTH = 1.6
const BORDER_INSET = BORDER_WIDTH / 2

export async function downloadPengajuanDanaPdf(item: DanaPengajuan) {
  if (item.status !== DANA_STATUS.APPROVED) {
    toast.error("PDF hanya tersedia setelah pengajuan disetujui")
    return
  }

  try {
    const tglDisetujui = item.tglDisetujui
      ? formatDanaDate(item.tglDisetujui)
      : "-"
    const pengelola = item.disetujuiOleh ?? "Pengelola"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      pageSize: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
      pageOrientation: "landscape",
      pageMargins: [BOX_PADDING, BOX_PADDING, BOX_PADDING, BOX_PADDING],
      background: (_currentPage: number, pageSize: { width: number; height: number }) => ({
        canvas: [
          {
            type: "rect",
            x: BORDER_INSET,
            y: BORDER_INSET,
            w: pageSize.width - BORDER_INSET * 2,
            h: pageSize.height - BORDER_INSET * 2,
            lineWidth: BORDER_WIDTH,
          },
        ],
      }),
      content: [
        {
          columns: [
            {
              text: "PT DASAN PAN PACIFIC INDONESIA",
              style: "company",
              width: "*",
            },
            {
              text: "PENGAJUAN DANA",
              style: "title",
              alignment: "right",
              width: "auto",
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: CONTENT_WIDTH,
              y2: 0,
              lineWidth: 0.8,
            },
          ],
          margin: [0, 6, 0, 8],
        },
        {
          table: {
            widths: ["*", RIGHT_COLUMN_WIDTH],
            body: [
              [
                { stack: buildIdentity(item, tglDisetujui) },
                { stack: buildAmount(item, pengelola) },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: (i: number) => (i === 1 ? 0.5 : 0),
            vLineColor: () => "#999999",
            paddingLeft: (i: number) => (i === 0 ? 0 : 10),
            paddingRight: (i: number) => (i === 0 ? 10 : 0),
            paddingTop: () => 0,
            paddingBottom: () => 0,
          },
        },
      ],
      styles: {
        company: { fontSize: 10, bold: true },
        title: { fontSize: 10, bold: true },
        caption: { fontSize: 7, color: "#666666", characterSpacing: 0.4 },
        meta: { fontSize: 9, color: "#555555" },
        metaValue: { fontSize: 9, bold: true },
        nominal: { fontSize: 16, bold: true },
        terbilang: { fontSize: 8, italics: true, color: "#444444" },
        body: { fontSize: 9 },
        signLabel: { fontSize: 8, color: "#555555" },
        signName: { fontSize: 8, bold: true },
      },
      defaultStyle: { fontSize: 9 },
    }

    downloadPdf(docDefinition, `${item.nomor}.pdf`)
    toast.success("PDF berhasil diunduh")
  } catch (error) {
    console.error("Error generating PDF pengajuan dana:", error)
    toast.error("Gagal mengunduh PDF")
  }
}

function buildIdentity(item: DanaPengajuan, tglDisetujui: string) {
  return [
    {
      table: {
        widths: [52, 6, "*"],
        body: [
          metaRow("Nomor", item.nomor),
          metaRow("Tanggal", formatDanaDate(item.tglDibuat)),
          metaRow("Pemohon", item.username),
          metaRow("Jabatan", item.jabatan),
          metaRow("Status", "DISETUJUI"),
          metaRow(
            "Disetujui",
            `${item.disetujuiOleh ?? "-"} · ${tglDisetujui}`
          ),
        ],
      },
      layout: "noBorders",
      margin: [0, 0, 0, 8],
    },
    { text: "KEPERLUAN", style: "caption", margin: [0, 0, 0, 3] },
    { text: item.keperluan, style: "body" },
  ]
}

function buildAmount(item: DanaPengajuan, pengelola: string) {
  return [
    { text: "NOMINAL DIAJUKAN", style: "caption" },
    {
      text: formatRupiah(item.nominal),
      style: "nominal",
      margin: [0, 2, 0, 2],
    },
    {
      text: `Terbilang: ${capitalize(terbilang(item.nominal))} rupiah`,
      style: "terbilang",
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        widths: ["*", "auto"],
        body: [
          amountRow(
            "Dana terpakai",
            formatRupiah(danaTerpakai(item.nominal, item.kembalian))
          ),
        ],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, 0, 0, 14],
    },
    {
      columns: [
        signatureBlock("Pemohon", item.username),
        signatureBlock("Pengelola", pengelola),
      ],
      columnGap: 12,
    },
  ]
}

function signatureBlock(role: string, name: string) {
  return {
    width: "*",
    alignment: "center",
    stack: [
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: SIGN_LINE_WIDTH,
            y2: 0,
            lineWidth: 0.5,
          },
        ],
        margin: [0, 0, 0, 3],
      },
      { text: role, style: "signLabel" },
      { text: `( ${name} )`, style: "signName" },
    ],
  }
}

function metaRow(label: string, value: string) {
  return [
    { text: label, style: "meta" },
    { text: ":", style: "meta" },
    { text: value, style: "metaValue" },
  ]
}

function amountRow(label: string, value: string) {
  return [
    { text: label, style: "meta" },
    { text: value, style: "metaValue", alignment: "right" },
  ]
}
