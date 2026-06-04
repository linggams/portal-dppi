import { cn } from "@/lib/utils"

interface PageSectionProps {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/** Bagian halaman dengan judul opsional; tanpa wrapper Card (cocok untuk tabel). */
export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: PageSectionProps) {
  const hasHeader = title || description || action

  return (
    <section className={cn("space-y-4", className)}>
      {hasHeader ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            {title ? (
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {action}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}
