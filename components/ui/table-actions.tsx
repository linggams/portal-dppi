"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function TableActions({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex justify-end gap-1", className)}>{children}</div>
  )
}

type TableActionButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "size" | "children"
> & {
  label: string
  icon: LucideIcon
  loading?: boolean
}

export function TableActionButton({
  label,
  icon: Icon,
  loading = false,
  className,
  variant = "ghost",
  ...props
}: TableActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="icon-sm"
          aria-label={label}
          className={className}
          {...props}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Icon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

type TableActionLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "children"
> & {
  label: string
  icon: LucideIcon
  buttonClassName?: string
}

export function TableActionLink({
  label,
  icon: Icon,
  buttonClassName,
  className,
  ...props
}: TableActionLinkProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={buttonClassName}
          asChild
        >
          <Link aria-label={label} className={className} {...props}>
            <Icon className="size-4" />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
