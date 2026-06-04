"use client"

import { Package } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { APP_NAME } from "@/lib/app-branding"
import { USER_LEVEL_LABEL, type AppUserLevel } from "@/lib/user-level"
import { usePageTitleValue } from "@/components/layout/page-title-context"
import { cn } from "@/lib/utils"

interface HeaderProps {
  userLevel: AppUserLevel
}

export function Header({ userLevel }: HeaderProps) {
  const pageTitle = usePageTitleValue()

  const title = pageTitle ?? APP_NAME

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      {pageTitle ? (
        <h1
          className={cn(
            "min-w-0 truncate text-base font-semibold tracking-tight md:text-lg"
          )}
        >
          {title}
        </h1>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Package className="size-4" aria-hidden />
          </span>
          <h1 className="truncate text-base font-semibold tracking-tight md:text-lg">
            {title}
          </h1>
        </div>
      )}
      <Badge variant="secondary" className="hidden sm:inline-flex">
        {USER_LEVEL_LABEL[userLevel] ?? userLevel}
      </Badge>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  )
}
