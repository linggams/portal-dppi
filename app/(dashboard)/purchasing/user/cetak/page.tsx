"use client"

import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Download, Printer, Search } from "lucide-react"
import { useCetakBPP } from "./hooks/useCetakBPP"
import {
  CetakDateFilter,
  CetakBPPCard,
  CetakLoadingSkeleton,
} from "./components"

export default function CetakBPPPage() {
  const {
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
  } = useCetakBPP()

  const hasData = Object.keys(groupedPermintaan).length > 0

  return (
    <DashboardLayout title="Cetak BPP">
      <PageActions>
        <Button size="sm" onClick={fetchPermintaan} disabled={loading}>
          <Search className="mr-1.5 size-3.5" />
          Tampilkan
        </Button>
        {hasData ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportAllPDF}
            >
              <Download className="mr-1.5 size-3.5" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="mr-1.5 size-3.5" />
              Cetak
            </Button>
          </>
        ) : null}
      </PageActions>

      <div className="space-y-6">
        <CetakDateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {loading ? (
          <CetakLoadingSkeleton />
        ) : !hasData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Tidak ada permintaan yang disetujui pada tanggal tersebut
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermintaan).map(([date, items]) => (
              <CetakBPPCard
                key={date}
                date={date}
                items={items}
                formatDate={formatDate}
                onDownloadPDF={handleDownloadPDF}
                onPrint={handlePrint}
                jabatan={session?.user?.jabatan}
                username={session?.user?.username}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:border-none,
          .print\\:shadow-none *,
          .print\\:border-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:pb-2 {
            padding-bottom: 0.5rem;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
