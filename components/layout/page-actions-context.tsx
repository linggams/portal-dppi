"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

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

/** Bar aksi di bawah header; lebar penuh dengan border seperti header. */
export function PageActionsBar() {
  const { actions } = usePageActionsContext()
  if (!actions) return null

  return (
    <div className="shrink-0 border-b bg-background">
      <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {actions}
      </div>
    </div>
  )
}

export function useRegisterPageActions() {
  return usePageActionsContext().setActions
}
