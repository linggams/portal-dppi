"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardLayout, ContentEmpty, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { Badge } from "@/components/ui/badge"

type Category = {
  idCategory: number
  name: string
  active: boolean
  parent: { name: string } | null
}

export default function ItmsCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/itms/categories?active=false")
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/itms/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create category")
        return
      }
      toast.success("Category created")
      setName("")
      await load()
    } catch {
      toast.error("Failed to create category")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Categories">
      <PageActions>
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className="w-56"
          />
          <Button onClick={onCreate} disabled={saving || !name.trim()}>
            Add
          </Button>
        </div>
      </PageActions>

      {!loading && rows.length === 0 ? (
        <ContentEmpty title="No categories" />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.idCategory}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.parent?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.active ? "default" : "outline"}>
                      {row.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  )
}
