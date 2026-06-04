import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: React.ReactNode
  className?: string
  compact?: boolean
}

export function StatCard({ label, value, className, compact }: StatCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 shadow-none",
        compact ? "py-0" : "py-4",
        className
      )}
    >
      <CardHeader className={cn(compact ? "px-3 py-2.5" : "pb-2")}>
        <CardDescription className={compact ? "text-xs" : undefined}>
          {label}
        </CardDescription>
        <CardTitle
          className={cn(
            "tabular-nums",
            compact ? "text-lg leading-tight" : "text-2xl"
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
