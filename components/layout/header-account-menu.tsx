"use client"

import { LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { USER_LEVEL_LABEL, normalizeUserLevel } from "@/lib/auth/user-level"

export function HeaderAccountMenu() {
  const { data: session } = useSession()
  const username = session?.user?.username ?? "User"
  const roleName =
    session?.user?.roleName ||
    USER_LEVEL_LABEL[normalizeUserLevel(session?.user?.level ?? "user")]
  const initials = username.slice(0, 1).toUpperCase() || "U"

  const handleLogout = async () => {
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : ""

    await signOut({ redirect: false })

    if (typeof window !== "undefined") {
      window.location.href = `${currentOrigin}/login`
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 max-w-[12rem] gap-2 px-2"
          aria-label="Account menu"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-col items-start text-left sm:flex">
            <span className="truncate text-sm font-medium leading-tight">
              {username}
            </span>
            <span className="truncate text-[11px] font-normal text-muted-foreground leading-tight">
              {roleName}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="truncate text-xs text-muted-foreground">{roleName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleLogout()}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
