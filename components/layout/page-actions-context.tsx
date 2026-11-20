"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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

/** Tinggi kontrol default shadcn (h-9) di seluruh bar aksi. */
const ACTIONS_CONTROL_CLASS = cn(
  "[&_button]:h-9",
  "[&_button[data-size=sm]]:h-9 [&_button[data-size=sm]]:px-4",
  "[&_[data-slot=input]]:h-9",
  "[&_[data-slot=select-trigger]]:h-9",
  "[&_[data-slot=select-trigger][data-size=sm]]:h-9"
)

/** Bar judul + aksi di bawah header; sticky, lebar penuh. Role ada di Header account. */
export function PageActionsBar() {
  const { actions } = usePageActionsContext()
  const pageTitle = usePageTitleValue()

  if (!actions && !pageTitle) return null

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-2 px-4 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:py-1.5">
        {pageTitle ? (
          <h1
            className={cn(
              "min-w-0 shrink truncate text-base font-semibold tracking-tight md:text-lg"
            )}
          >
            {pageTitle}
          </h1>
        ) : null}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-wrap items-center gap-2",
            "justify-start sm:justify-end",
            "max-sm:[&>button]:min-h-9 max-sm:[&>button]:flex-1 max-sm:[&>a]:flex-1",
            ACTIONS_CONTROL_CLASS
          )}
        >
          {actions}
        </div>
      </div>
    </div>
  )
}

export function useRegisterPageActions() {
  return usePageActionsContext().setActions
}
