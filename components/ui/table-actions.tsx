"use client"

import * as React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Loader2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function TableActions({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const items = React.Children.toArray(children).filter(Boolean)
  if (items.length === 0) return null

  return (
    <div className={cn("flex justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Aksi"
            className="size-6 text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {items}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

type TableActionButtonProps = {
  label: string
  icon?: LucideIcon
  loading?: boolean
  disabled?: boolean
  className?: string
  /** Diabaikan — kompatibilitas pemakaian lama berbasis Button. */
  variant?: string
  onClick?: (event: Event) => void
}

export function TableActionButton({
  label,
  icon: Icon,
  loading = false,
  className,
  disabled,
  onClick,
  variant,
}: TableActionButtonProps) {
  const isDestructive =
    variant === "destructive" ||
    className?.includes("text-destructive") === true

  return (
    <DropdownMenuItem
      variant={isDestructive ? "destructive" : "default"}
      disabled={disabled || loading}
      className={className}
      onSelect={(event) => {
        if (disabled || loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {label}
    </DropdownMenuItem>
  )
}

type TableActionLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "children"
> & {
  label: string
  icon?: LucideIcon
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
    <DropdownMenuItem asChild className={buttonClassName}>
      <Link className={cn("cursor-pointer", className)} {...props}>
        {Icon ? <Icon className="size-4" /> : null}
        {label}
      </Link>
    </DropdownMenuItem>
  )
}
