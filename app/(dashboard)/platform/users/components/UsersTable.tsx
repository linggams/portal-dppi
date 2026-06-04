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

function getLevelLabel(level: string) {
  switch (level) {
    case "administrator":
    case "admin":
      return "Administrator"
    case "it_support":
      return "IT Support"
    case "purchasing":
      return "Purchasing"
    case "user":
      return "User"
    default:
      return level
  }
}

export function UsersTable({ data, onEdit, onDelete }: UsersTableProps) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmptyState colSpan={5} title="Tidak ada data user" />
          ) : (
            data.map((user, index) => (
              <TableRow key={user.idUser}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.level === "administrator"
                        ? "default"
                        : user.level === "it_support"
                          ? "outline"
                          : user.level === "purchasing"
                            ? "secondary"
                            : "secondary"
                    }
                  >
                    {getLevelLabel(user.level)}
                  </Badge>
                </TableCell>
                <TableCell>{user.jabatan}</TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <TableActionButton label="Edit" icon={Pencil} onClick={() => onEdit(user)} />
                    <TableActionButton label="Hapus" icon={Trash2} className="text-destructive hover:text-destructive" onClick={() => onDelete(user)} />
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
