"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { BrandMark } from "@/components/layout/BrandMark"
import { HeaderAccountMenu } from "@/components/layout/header-account-menu"

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <BrandMark className="shrink-0" />
      <SidebarTrigger className="size-8 shrink-0" />
      <div className="flex-1" />
      <ThemeToggle />
      <HeaderAccountMenu />
    </header>
  )
}
