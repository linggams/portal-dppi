import { COMPANY_LEGAL_NAME, COMPANY_MARK } from "@/lib/shared/app-branding"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  className?: string
}

/** Compact corporate mark: geometric D glyph + DASAN wordmark. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
      title={COMPANY_LEGAL_NAME}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-8 shrink-0"
        aria-hidden
      >
        <rect width="32" height="32" rx="7" className="fill-foreground" />
        <path
          d="M9.5 7.5h7.1c5.35 0 8.9 3.25 8.9 8.5s-3.55 8.5-8.9 8.5H9.5V7.5Zm3.35 3.15v10.7h3.7c3.45 0 5.45-1.95 5.45-5.35 0-3.4-2-5.35-5.45-5.35h-3.7Z"
          className="fill-background"
        />
        <circle cx="24.25" cy="24.25" r="1.35" className="fill-background" opacity="0.7" />
      </svg>
      <span className="truncate text-[15px] font-semibold tracking-[0.16em] text-foreground">
        {COMPANY_MARK}
      </span>
    </span>
  )
}
