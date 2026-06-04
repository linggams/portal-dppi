import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SectionCard({
  title,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b py-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="py-6">{children}</CardContent>
    </Card>
  )
}
