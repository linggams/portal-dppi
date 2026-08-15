"use client"

import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableContainer } from "@/components/ui/table-container"
import { TableEmptyState } from "@/components/ui/table-empty-state"
import { Badge } from "@/components/ui/badge"
import { MANAGER_MODULE_OPTIONS } from "@/lib/auth/manager-modules"
import { APPLICANT_MODULE_OPTIONS } from "@/lib/auth/applicant-modules"
import type { User } from "../types"
import {
  TableActionButton,
  TableActions,
} from "@/components/ui/table-actions"

interface UsersTableProps {
  data: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UsersTable({ data, onEdit, onDelete }: UsersTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Modul</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmptyState colSpan={6} title="Tidak ada data user" />
          ) : (
            data.map((user, index) => (
              <TableRow key={user.idUser}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.role?.code === "administrator" ? "default" : "secondary"
                    }
                  >
                    {user.role?.name ?? user.level ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.role?.code === "administrator" ? (
                    <div className="flex flex-wrap gap-1">
                      {MANAGER_MODULE_OPTIONS.filter(
                        (option) => user[option.key]
                      ).map((option) => (
                        <Badge key={option.key} variant="outline">
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  ) : user.role?.code === "user" ? (
                    <div className="flex flex-wrap gap-1">
                      {APPLICANT_MODULE_OPTIONS.filter(
                        (option) => user[option.key]
                      ).map((option) => (
                        <Badge key={option.key} variant="outline">
                          {option.label}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>{user.jabatan}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <TableActionButton
                      label="Edit"
                      icon={Pencil}
                      onClick={() => onEdit(user)}
                    />
                    <TableActionButton
                      label="Hapus"
                      icon={Trash2}
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(user)}
                    />
                  </TableActions>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
