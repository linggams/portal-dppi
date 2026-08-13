import { toast } from "sonner"
import { downloadPdf } from "@/lib/makepdf"
import { danaTerpakai, DANA_STATUS } from "./constants"
import type { DanaPengajuan } from "./dana-types"
import { capitalize, formatDanaDate, formatRupiah, terbilang } from "./format"

export async function downloadPengajuanDanaPdf(item: DanaPengajuan) {
  if (item.status !== DANA_STATUS.APPROVED) {
    toast.error("PDF hanya tersedia setelah pengajuan disetujui")
    return
  }

  try {
    const terbilangText = `${terbilang(item.nominal)} rupiah`
    const tglDisetujui = item.tglDisetujui
      ? formatDanaDate(item.tglDisetujui)
      : "-"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [48, 56, 48, 48],
      content: [
        {
          text: "PT DASAN PAN PACIFIC INDONESIA",
          style: "header",
          alignment: "center",
        },
        {
          text: "Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi, Jawa Barat 43355",
          style: "subheader",
          alignment: "center",
          margin: [0, 4, 0, 8],
        },
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 1 }],
          margin: [0, 0, 0, 12],
        },
        {
          text: "PENGAJUAN DANA",
          style: "title",
          alignment: "center",
          decoration: "underline",
          margin: [0, 0, 0, 16],
        },
        {
          table: {
            widths: [110, 12, "*"],
            body: [
              metaRow("Nomor", item.nomor),
              metaRow("Tanggal", formatDanaDate(item.tglDibuat)),
              metaRow("Pemohon", item.username),
              metaRow("Unit", item.jabatan),
              metaRow("Nominal", formatRupiah(item.nominal)),
              metaRow("Kembalian", formatRupiah(item.kembalian)),
              metaRow(
                "Terpakai",
                formatRupiah(danaTerpakai(item.nominal, item.kembalian))
              ),
              metaRow("Terbilang", capitalize(terbilangText)),
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 0, 12],
        },
        { text: "Keperluan", style: "label", margin: [0, 0, 0, 4] },
        {
          text: item.keperluan,
          style: "body",
          margin: [0, 0, 0, 16],
        },
        {
          table: {
            widths: [110, 12, "*"],
            body: [
              metaRow("Status", "DISETUJUI"),
              metaRow("Disetujui", `${item.disetujuiOleh ?? "-"} · ${tglDisetujui}`),
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 0, 36],
        },
        {
          columns: [
            {
              width: "*",
              alignment: "center",
              stack: [
                { text: "Pemohon", style: "signLabel" },
                { text: "\n\n\n", fontSize: 10 },
                { text: `( ${item.username} )`, style: "signName" },
              ],
            },
            {
              width: "*",
              alignment: "center",
              stack: [
                { text: "Pengelola", style: "signLabel" },
                { text: "\n\n\n", fontSize: 10 },
                {
                  text: `( ${item.disetujuiOleh ?? "Pengelola"} )`,
                  style: "signName",
                },
              ],
            },
          ],
        },
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        subheader: { fontSize: 9 },
        title: { fontSize: 13, bold: true },
        label: { fontSize: 10, bold: true },
        body: { fontSize: 10 },
        meta: { fontSize: 10 },
        metaBold: { fontSize: 10, bold: true },
        signLabel: { fontSize: 10 },
        signName: { fontSize: 10, bold: true },
      },
      defaultStyle: { fontSize: 10 },
    }

    downloadPdf(docDefinition, `${item.nomor}.pdf`)
    toast.success("PDF berhasil diunduh")
  } catch (error) {
    console.error("Error generating PDF pengajuan dana:", error)
    toast.error("Gagal mengunduh PDF")
  }
}

function metaRow(label: string, value: string) {
  return [
    { text: label, style: "meta" },
    { text: ":", style: "meta" },
    { text: value, style: "metaBold" },
  ]
}
