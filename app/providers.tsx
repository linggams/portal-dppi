"use client"

import { SessionProvider } from "next-auth/react"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes"

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // React 19 warns about <script> inside client components. next-themes uses
  // one to prevent theme flash; application/json avoids the false-positive warning.
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const)

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
