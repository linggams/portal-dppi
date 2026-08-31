"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ItSupportAnnouncementDialog } from "@/components/it/ItSupportAnnouncementDialog"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { Header } from "./Header"
import {
  PageActionsBar,
  PageActionsProvider,
} from "./page-actions-context"
import { PageTitleProvider, SetPageTitle } from "./page-title-context"
import {
  canAccessItStaff,
  canAccessItUser,
} from "@/lib/auth/permissions"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

const USER_DASHBOARD_PATH = "/purchasing/user/dashboard"

export function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const username = user?.username ?? ""
  const showItSupportAnnouncement = user
    ? canAccessItUser(user) &&
      !canAccessItStaff(user) &&
      pathname === USER_DASHBOARD_PATH
    : false

  if (!user?.username) {
    return null
  }

  return (
    <SidebarProvider className="flex h-svh flex-col overflow-hidden">
      <PageTitleProvider>
        <PageActionsProvider>
          {title ? <SetPageTitle title={title} /> : null}
          <Header roleName={user.roleName || user.level} />
          <div className="flex min-h-0 w-full flex-1 overflow-hidden">
            <Suspense fallback={null}>
              <AppSidebar />
            </Suspense>
            <SidebarInset className="min-h-0 overflow-hidden">
              <PageActionsBar />
              <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] focus:outline-none">
                <div className="w-full space-y-6 px-4 py-6">
                  {children}
                </div>
              </div>
              {showItSupportAnnouncement && username ? (
                <ItSupportAnnouncementDialog username={username} />
              ) : null}
            </SidebarInset>
          </div>
        </PageActionsProvider>
      </PageTitleProvider>
    </SidebarProvider>
  )
}
