import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentEmptyProps {
  title?: string
  description?: string
  className?: string
}

export function ContentEmpty({
  title = "Tidak ada data",
  description,
  className,
}: ContentEmptyProps) {
  return (
    <Empty className={cn("border-0 py-12", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
    </Empty>
  )
}
