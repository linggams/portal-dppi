import { cn } from "@/lib/utils"

interface PageActionsProps {
  children?: React.ReactNode
  className?: string
}

export function PageActions({ children, className }: PageActionsProps) {
  if (!children) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2",
        className
      )}
    >
      {children}
    </div>
  )
}
