import { COMPANY_LEGAL_NAME, COMPANY_MARK } from "@/lib/shared/app-branding"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "flex h-8 w-full shrink-0 items-center justify-center rounded-md border border-black bg-black px-2 text-sm font-bold leading-none text-white",
        className
      )}
      title={COMPANY_LEGAL_NAME}
    >
      {COMPANY_MARK}
    </span>
  )
}
