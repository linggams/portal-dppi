"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Badge } from "@/components/ui/badge"
import { usePageTitleValue } from "@/components/layout/page-title-context"
import { cn } from "@/lib/utils"

interface PageActionsContextValue {
  actions: ReactNode
  setActions: (actions: ReactNode) => void
}

const PageActionsContext = createContext<PageActionsContextValue | null>(null)

export function PageActionsProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActionsState] = useState<ReactNode>(null)

  const setActions = useCallback((next: ReactNode) => {
    setActionsState(next)
  }, [])

  const value = useMemo(
    () => ({ actions, setActions }),
    [actions, setActions]
  )

  return (
    <PageActionsContext.Provider value={value}>
      {children}
    </PageActionsContext.Provider>
  )
}

function usePageActionsContext() {
  const context = useContext(PageActionsContext)
  if (!context) {
    throw new Error("PageActions must be used within PageActionsProvider")
  }
  return context
}

interface PageActionsBarProps {
  roleName?: string
}

/** Bar judul + role + aksi di bawah header; sticky, lebar penuh. */
export function PageActionsBar({ roleName }: PageActionsBarProps) {
  const { actions } = usePageActionsContext()
  const pageTitle = usePageTitleValue()

  if (!actions && !pageTitle && !roleName) return null

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-wrap items-center gap-2 px-4 py-1.5">
        {pageTitle ? (
          <h1
            className={cn(
              "min-w-0 shrink truncate text-base font-semibold tracking-tight md:text-lg"
            )}
          >
            {pageTitle}
          </h1>
        ) : null}
        {roleName ? (
          <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
            {roleName}
          </Badge>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      </div>
    </div>
  )
}

export function useRegisterPageActions() {
  return usePageActionsContext().setActions
}
