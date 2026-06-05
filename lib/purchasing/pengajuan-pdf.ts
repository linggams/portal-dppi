import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { downloadPdf } from "@/lib/makepdf"

interface PengajuanPdfItem {
  kodeBrg: string
  jumlah: number
  satuan: string
  hargabarang: number
  total: number
  stokbarang: { namaBrg: string }
}

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: id })
  } catch {
    return dateString
  }
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export async function downloadPengajuanGroupPdf(
  unit: string,
  tglPengajuan: string
) {
  try {
    const response = await fetch(
      `/api/purchasing/pengajuan?unit=${encodeURIComponent(unit)}&tgl_pengajuan=${tglPengajuan}`
    )
    if (!response.ok) {
      throw new Error("Gagal memuat data pengajuan")
    }
    const data: PengajuanPdfItem[] = await response.json()

    if (data.length === 0) {
      toast.error("Tidak ada data untuk dicetak")
      return
    }

    const filename = `Pengajuan_${unit}_${tglPengajuan}.pdf`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any[] = [
      [
        { text: "No.", style: "tableHeader" },
        { text: "Kode Barang", style: "tableHeader" },
        { text: "Nama Barang", style: "tableHeader" },
        { text: "Satuan", style: "tableHeader" },
        { text: "Jumlah", style: "tableHeader" },
        { text: "Harga Barang", style: "tableHeader" },
        { text: "Total", style: "tableHeader" },
      ],
      ...data.map((item, index) => [
        { text: String(index + 1), alignment: "center" },
        { text: item.kodeBrg, alignment: "center" },
        { text: item.stokbarang.namaBrg },
        { text: item.satuan, alignment: "center" },
        { text: String(item.jumlah), alignment: "center" },
        { text: formatRupiah(item.hargabarang), alignment: "right" },
        { text: formatRupiah(item.total), alignment: "right" },
      ]),
    ]

    const subtotalJumlah = data.reduce((sum, item) => sum + item.jumlah, 0)
    const subtotalHarga = data.reduce((sum, item) => sum + item.hargabarang, 0)
    const subtotalTotal = data.reduce((sum, item) => sum + item.total, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      pageSize: "A4",
      pageOrientation: "portrait",
      pageMargins: [40, 60, 40, 40],
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
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
          margin: [0, 0, 0, 8],
        },
        {
          text: "FORM PENGAJUAN BARANG",
          style: "title",
          alignment: "center",
          decoration: "underline",
          margin: [0, 0, 0, 10],
        },
        { text: "Permintaan Pembelian Barang", style: "meta" },
        {
          text: [
            { text: "Pada Tanggal : ", style: "meta" },
            { text: formatDate(tglPengajuan), style: "metaBold" },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "*", "auto", "auto", "auto", "auto"],
            body,
          },
          layout: "lightHorizontalLines",
        },
        {
          table: {
            headerRows: 0,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              [
                {
                  text: "Sub Total",
                  style: "subtotalLabel",
                  alignment: "center",
                },
                {
                  text: String(subtotalJumlah),
                  style: "subtotalValue",
                  alignment: "center",
                },
                {
                  text: formatRupiah(subtotalHarga),
                  style: "subtotalValue",
                  alignment: "center",
                },
                {
                  text: formatRupiah(subtotalTotal),
                  style: "subtotalValue",
                  alignment: "center",
                },
              ],
            ],
          },
          margin: [0, 10, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        subheader: { fontSize: 9 },
        title: { fontSize: 12, bold: true },
        meta: { fontSize: 10 },
        metaBold: { fontSize: 10, bold: true },
        tableHeader: {
          bold: true,
          fontSize: 9,
          fillColor: "#f3f4f6",
          alignment: "center",
        },
        subtotalLabel: { bold: true, fillColor: "#f3f4f6", fontSize: 10 },
        subtotalValue: { bold: true, fontSize: 10 },
      },
      defaultStyle: { fontSize: 9 },
    }

    downloadPdf(docDefinition, filename)
    toast.success("PDF berhasil diunduh")
  } catch (error) {
    console.error("Error generating PDF:", error)
    toast.error("Gagal mengunduh PDF")
  }
}
