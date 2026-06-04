"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Eye } from "lucide-react"
import {
  ContentEmpty,
  DashboardLayout,
  FilterSummaryPanel,
  PageActions,
  PageSection,
} from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TableActionLink } from "@/components/ui/table-actions"
import {
  formatDurasiMenit,
  getMaintenanceRowClassName,
  IT_HASIL_PEKERJAAN_LABEL,
  IT_JENIS_PEKERJAAN_LABEL,
} from "@/lib/it/maintenance-shared"
import { formatTiketDate } from "@/lib/it/utils"
import { useItMaintenance } from "./hooks/useItMaintenance"
import {
  ItMaintenanceFilters,
  ItMaintenanceSummary,
  MaintenanceFormDialog,
  MaintenanceSumberBadge,
} from "./components"
import type { MaintenanceListItem } from "./types"

interface KategoriOption {
  idKategori: number
  nama: string
}

function detailHref(row: MaintenanceListItem) {
  if (row.idTiket) return `/it/staff/tiket/${row.idTiket}`
  return null
}

export default function ItMaintenancePage() {
  const { data: session } = useSession()
  const [kategori, setKategori] = useState<KategoriOption[]>([])
  const [formOpen, setFormOpen] = useState(false)

  const {
    loading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    listData,
    kategoriData,
    teknisiData,
    summary,
    fetchData,
    hasData,
  } = useItMaintenance()

  useEffect(() => {
    fetch("/api/it/kategori")
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setKategori(data) : setKategori([])))
      .catch(() => setKategori([]))
  }, [])

  return (
    <DashboardLayout title="Maintenance / Log Pekerjaan">
      <PageActions>
        <Button onClick={() => setFormOpen(true)}>Catat Pekerjaan</Button>
        <Button asChild variant="outline">
          <Link href="/it/staff/kategori">Kelola Kategori</Link>
        </Button>
      </PageActions>

      <div className="space-y-4">
        <FilterSummaryPanel
          filter={
            <ItMaintenanceFilters
              filters={filters}
              kategori={kategori}
              onFiltersChange={setFilters}
              onFetch={fetchData}
            />
          }
          summary={
            loading && !summary ? (
              <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : (
              <ItMaintenanceSummary summary={summary} />
            )
          }
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "daftar" | "kategori" | "teknisi")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="daftar">Daftar Pekerjaan</TabsTrigger>
            <TabsTrigger value="kategori">Per Kategori</TabsTrigger>
            <TabsTrigger value="teknisi">Per Teknisi</TabsTrigger>
          </TabsList>

          <TabsContent value="daftar">
            <PageSection title="Daftar Pekerjaan">
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : !hasData ? (
                <ContentEmpty
                  title="Belum ada pekerjaan"
                  description="Ubah filter atau catat pekerjaan manual"
                />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Teknisi</TableHead>
                        <TableHead>Sumber</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Hasil</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listData.map((row) => {
                        const href = detailHref(row)
                        return (
                          <TableRow
                            key={row.id}
                            className={getMaintenanceRowClassName(row.sumber)}
                          >
                            <TableCell className="whitespace-nowrap text-sm">
                              {formatTiketDate(row.tglKerja)}
                            </TableCell>
                            <TableCell>{row.username}</TableCell>
                            <TableCell>
                              <MaintenanceSumberBadge sumber={row.sumber} />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{row.kategoriNama}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[240px]">
                              <div className="flex flex-col gap-1">
                                {row.sumber === "tiket" && row.nomorTiket ? (
                                  <span className="font-mono text-xs text-blue-700 dark:text-blue-300">
                                    {row.nomorTiket}
                                  </span>
                                ) : null}
                                <span className="font-medium">{row.judul}</span>
                                {row.jenisPekerjaan ? (
                                  <Badge variant="secondary" className="w-fit text-[10px]">
                                    {IT_JENIS_PEKERJAAN_LABEL[row.jenisPekerjaan] ??
                                      row.jenisPekerjaan}
                                  </Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>{row.lokasi ?? "—"}</TableCell>
                            <TableCell>{formatDurasiMenit(row.durasiMenit)}</TableCell>
                            <TableCell>
                              {IT_HASIL_PEKERJAAN_LABEL[row.hasil] ?? row.hasil}
                            </TableCell>
                            <TableCell className="text-right">
                              {href ? (
                                <TableActionLink
                                  label="Detail"
                                  icon={Eye}
                                  href={href}
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </PageSection>
          </TabsContent>

          <TabsContent value="kategori">
            <PageSection title="Ringkasan per Kategori">
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : !hasData ? (
                <ContentEmpty title="Tidak ada data" />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Dari tiket</TableHead>
                        <TableHead>Manual</TableHead>
                        <TableHead>Rata-rata durasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kategoriData.map((k) => (
                        <TableRow key={k.idKategori}>
                          <TableCell className="font-medium">
                            {k.kategoriNama}
                          </TableCell>
                          <TableCell>{k.total}</TableCell>
                          <TableCell>
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              {k.dariTiket}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-amber-800 dark:text-amber-200">
                              {k.manual}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDurasiMenit(k.rataRataMenit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </PageSection>
          </TabsContent>

          <TabsContent value="teknisi">
            <PageSection title="Ringkasan per Teknisi">
              {loading ? (
                <Skeleton className="h-40 w-full" />
              ) : !hasData ? (
                <ContentEmpty title="Tidak ada data" />
              ) : (
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teknisi</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Dari tiket</TableHead>
                        <TableHead>Manual</TableHead>
                        <TableHead>Rata-rata durasi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teknisiData.map((t) => (
                        <TableRow key={t.username}>
                          <TableCell className="font-medium">{t.username}</TableCell>
                          <TableCell>{t.total}</TableCell>
                          <TableCell>
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              {t.dariTiket}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-amber-800 dark:text-amber-200">
                              {t.manual}
                            </span>
                          </TableCell>
                          <TableCell>
                            {formatDurasiMenit(t.rataRataMenit)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </PageSection>
          </TabsContent>
        </Tabs>
      </div>

      <MaintenanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        kategori={kategori}
        defaultUsername={session?.user?.username ?? ""}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  )
}
