"use client"

import { SerwistProvider as SerwistReactProvider } from "@serwist/turbopack/react"

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  return (
    <SerwistReactProvider
      swUrl="/serwist/sw.js"
      // Hindari SW agresif saat development (cache mengganggu HMR).
      disable={process.env.NODE_ENV === "development"}
      cacheOnNavigation={false}
    >
      {children}
    </SerwistReactProvider>
  )
}
