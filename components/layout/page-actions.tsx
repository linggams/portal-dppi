"use client"

import { useEffect } from "react"
import { useRegisterPageActions } from "@/components/layout/page-actions-context"

interface PageActionsProps {
  children?: React.ReactNode
}

/**
 * Daftarkan tombol aksi halaman; dirender di PageActionsBar (full width, border-b seperti header).
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
