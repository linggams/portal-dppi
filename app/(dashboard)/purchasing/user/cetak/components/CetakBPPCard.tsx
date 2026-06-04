"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import type { Permintaan } from "../types"

interface CetakBPPCardProps {
  date: string
  items: Permintaan[]
  formatDate: (dateString: string) => string
  onDownloadPDF: (date: string, items: Permintaan[]) => void
  onPrint: () => void
  jabatan?: string
  username?: string
}

export function CetakBPPCard({
  date,
  items,
  formatDate,
  onDownloadPDF,
  onPrint,
  jabatan = "",
  username = "",
}: CetakBPPCardProps) {
  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="print:pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">
              BUKTI PERMINTAAN BARANG (BPP)
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onDownloadPDF(date, items)}
              className="hidden print:hidden"
              variant="default"
            >
              Unduh PDF
            </Button>
            <Button
              onClick={onPrint}
              className="hidden print:hidden"
              variant="outline"
            >
              Cetak
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div id={`pdf-content-${date}`}>
          <div className="space-y-4">
            <div className="text-center mb-4 print:mb-2">
              <h2 className="text-xl font-bold">PT DASAN PAN PACIFIC INDONESIA</h2>
              <p className="text-sm">
                Parakansalak, Bojonglongok, Kec. Parakansalak, Kabupaten Sukabumi,
                Jawa Barat 43355
              </p>
              <hr className="my-2" />
              <h3 className="text-lg font-bold">BUKTI PERMINTAAN BARANG (BPP)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Unit:</p>
                <p>{items[0]?.unit ?? ""}</p>
              </div>
              <div>
                <p className="font-semibold">Departemen:</p>
                <p>{items[0]?.instansi ?? ""}</p>
              </div>
              <div>
                <p className="font-semibold">Tanggal:</p>
                <p>{formatDate(date)}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p>Disetujui</p>
              </div>
            </div>

            <TableContainer className="print:border-none">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-center">Satuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.idPermintaan}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.stokbarang.namaBrg}</TableCell>
                    <TableCell className="text-center">
                      {item.jumlah}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.stokbarang.satuan}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </TableContainer>

            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <p className="font-semibold mb-4">Yang Meminta,</p>
                <div className="border-t pt-2">
                  <p>{jabatan}</p>
                  <p className="text-sm text-muted-foreground mt-8">{username}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-4">Mengetahui,</p>
                <div className="border-t pt-2">
                  <p>Admin</p>
                  <p className="text-sm text-muted-foreground mt-8">
                    PT DASAN PAN PACIFIC INDONESIA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
