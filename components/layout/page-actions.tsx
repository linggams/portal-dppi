"use client"

import { useEffect } from "react"
import { useRegisterPageActions } from "@/components/layout/page-actions-context"

interface PageActionsProps {
  children?: React.ReactNode
}

/**
 * Daftarkan tombol/filter halaman; dirender di kanan PageActionsBar (setelah judul + role).
 */
export function PageActions({ children }: PageActionsProps) {
  const setActions = useRegisterPageActions()

  useEffect(() => {
    if (!children) {
      setActions(null)
      return
    }
    setActions(children)
    return () => setActions(null)
  }, [children, setActions])

  return null
}
