"use client"

import { SectionCard } from "@/components/layout"
import type { DanaPengajuan } from "@/lib/dana/dana-types"
import { danaTerpakai, DANA_STATUS } from "@/lib/dana/constants"
import {
  capitalize,
  formatDanaDate,
  formatRupiah,
  terbilang,
} from "@/lib/dana/format"
import { getDanaStatusBadge } from "@/lib/dana/status"

export function PengajuanDetailView({ item }: { item: DanaPengajuan }) {
  return (
    <SectionCard title="Detail pengajuan">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Nomor" value={item.nomor} />
        <DetailField label="Status" value={getDanaStatusBadge(item.status)} />
        <DetailField label="Pemohon" value={`${item.username} · ${item.jabatan}`} />
        <DetailField label="Tanggal" value={formatDanaDate(item.tglDibuat)} />
        <DetailField label="Nominal" value={formatRupiah(item.nominal)} />
        <DetailField
          label="Terbilang"
          value={capitalize(`${terbilang(item.nominal)} rupiah`)}
        />
        {item.status === DANA_STATUS.APPROVED ? (
          <>
            <DetailField
              label="Kembalian"
              value={formatRupiah(item.kembalian)}
            />
            <DetailField
              label="Terpakai"
              value={formatRupiah(danaTerpakai(item.nominal, item.kembalian))}
            />
          </>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-xs text-muted-foreground">Keperluan</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm">{item.keperluan}</dd>
        </div>
        {item.status === DANA_STATUS.APPROVED ? (
          <DetailField
            label="Disetujui"
            value={`${item.disetujuiOleh ?? "-"} · ${
              item.tglDisetujui ? formatDanaDate(item.tglDisetujui) : "-"
            }`}
          />
        ) : null}
        {item.status === DANA_STATUS.REJECTED && item.alasanTolak ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Alasan tolak</dt>
            <dd className="mt-1 text-sm text-destructive">{item.alasanTolak}</dd>
          </div>
        ) : null}
      </dl>
    </SectionCard>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  )
}
