"use client"

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
import { PageContentTitle } from "./page-content-title"
import { PageTitleProvider, SetPageTitle } from "./page-title-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  /** Tampilkan judul halaman di atas konten (mis. di atas tabel) */
  contentTitle?: boolean
}

const USER_DASHBOARD_PATH = "/purchasing/user/dashboard"

export function DashboardLayout({
  children,
  title,
  contentTitle = false,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userLevel = session?.user?.level
  const username = session?.user?.username ?? ""
  const showItSupportAnnouncement =
    userLevel === "user" && pathname === USER_DASHBOARD_PATH

  if (
    !userLevel ||
    (userLevel !== "administrator" &&
      userLevel !== "user" &&
      userLevel !== "it_support" &&
      userLevel !== "purchasing")
  ) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar userLevel={userLevel} />
      <SidebarInset>
        <PageTitleProvider>
          <PageActionsProvider>
            {title ? <SetPageTitle title={title} /> : null}
            <Header userLevel={userLevel} />
            <PageActionsBar />
            <main className="relative flex-1 overflow-y-auto focus:outline-none">
              <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {contentTitle ? <PageContentTitle /> : null}
                {children}
              </div>
            </main>
          </PageActionsProvider>
          {showItSupportAnnouncement && username ? (
            <ItSupportAnnouncementDialog username={username} />
          ) : null}
        </PageTitleProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
