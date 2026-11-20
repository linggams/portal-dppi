"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./Sidebar"
import { Header } from "./Header"
import {
  PageActionsBar,
  PageActionsProvider,
} from "./page-actions-context"
import { PageTitleProvider, SetPageTitle } from "./page-title-context"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const { data: session } = useSession()
  const user = session?.user

  if (!user?.username) {
    return null
  }

  return (
    <SidebarProvider className="flex h-svh flex-col overflow-hidden">
      <PageTitleProvider>
        <PageActionsProvider>
          {title ? <SetPageTitle title={title} /> : null}
          <Header />
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
            </SidebarInset>
          </div>
        </PageActionsProvider>
      </PageTitleProvider>
    </SidebarProvider>
  )
}
