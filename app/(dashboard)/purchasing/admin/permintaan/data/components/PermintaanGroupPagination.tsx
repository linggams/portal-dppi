"use client"

import { TablePagination } from "@/components/ui/table-pagination"

interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function PermintaanGroupPagination(props: Props) {
  return <TablePagination {...props} itemLabel="batch" />
}
