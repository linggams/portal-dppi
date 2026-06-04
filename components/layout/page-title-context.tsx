"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

interface PageTitleContextValue {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null)

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitleState] = useState("")

  const setTitle = useCallback((nextTitle: string) => {
    setTitleState(nextTitle)
  }, [])

  const value = useMemo(() => ({ title, setTitle }), [title, setTitle])

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  )
}

function usePageTitleContext() {
  const context = useContext(PageTitleContext)
  if (!context) {
    throw new Error("usePageTitle must be used within PageTitleProvider")
  }
  return context
}

export function usePageTitle(title: string) {
  const { setTitle } = usePageTitleContext()

  useEffect(() => {
    setTitle(title)
    return () => setTitle("")
  }, [title, setTitle])
}

export function SetPageTitle({ title }: { title: string }) {
  usePageTitle(title)
  return null
}

export function usePageTitleValue() {
  return usePageTitleContext().title
}
