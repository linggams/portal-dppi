"use client"

import {
  DashboardLayout,
  PageActions,
  PageActionsFilters,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useCetakBPP } from "./hooks/useCetakBPP"
import { CetakBPPCard, CetakLoadingSkeleton } from "./components"

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
    <DashboardLayout title="Print BPP">
      <PageActions>
        <PageActionsFilters label="Filter" title="Filter by date">
          <DatePicker
            className="w-[180px]"
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Request date"
          />
          <Button onClick={fetchPermintaan} disabled={loading}>
            Show
          </Button>
        </PageActionsFilters>
        {hasData ? (
          <>
            <Button variant="outline" onClick={handleExportAllPDF}>
              Export
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              Print
            </Button>
          </>
        ) : null}
      </PageActions>

      <div className="space-y-6">
        {loading ? (
          <CetakLoadingSkeleton />
        ) : !hasData ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No approved requests on that date
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
