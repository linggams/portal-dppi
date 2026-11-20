import { Badge } from "@/components/ui/badge"

export type GroupStatusFields = {
  hasPending: boolean
  statusMin: number
  statusMax: number
}

export function getGroupStatusBadge(group: GroupStatusFields) {
  if (group.hasPending) {
    if (group.statusMin !== group.statusMax) {
      return <Badge variant="outline">Partially pending</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }
  if (group.statusMin === 1 && group.statusMax === 1) {
    return <Badge variant="default">Approved</Badge>
  }
  if (group.statusMin === 2 && group.statusMax === 2) {
    return <Badge variant="destructive">Rejected</Badge>
  }
  return <Badge variant="secondary">Mixed</Badge>
}

export function getPermintaanItemStatusBadge(status: number) {
  switch (status) {
    case 0:
      return <Badge variant="outline">Pending</Badge>
    case 1:
      return <Badge variant="default">Approved</Badge>
    case 2:
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}
