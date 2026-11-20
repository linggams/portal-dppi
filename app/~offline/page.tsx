import Link from "next/link"
import { BrandMark } from "@/components/layout/BrandMark"
import { Button } from "@/components/ui/button"
import { APP_NAME, APP_TAGLINE } from "@/lib/shared/app-branding"

export const metadata = {
  title: `Offline · ${APP_NAME}`,
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <BrandMark />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">You are offline</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {APP_TAGLINE}. Check your internet connection, then reload the page.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Try again</Link>
      </Button>
    </main>
  )
}
