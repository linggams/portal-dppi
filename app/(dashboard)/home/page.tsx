"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { EMPTY_CAPABILITIES } from "@/lib/auth/capabilities"
import { USER_LEVEL_LABEL, normalizeUserLevel } from "@/lib/auth/user-level"
import { APP_NAME, APP_TAGLINE } from "@/lib/shared/app-branding"
import { getAccessibleHubModules } from "@/lib/shared/module-hub"

export default function ModuleHubPage() {
  const { data: session } = useSession()
  const principal = {
    level: session?.user?.level,
    capabilities: session?.user?.capabilities ?? EMPTY_CAPABILITIES,
    homePath: session?.user?.homePath,
    roleName: session?.user?.roleName,
  }
  const modules = getAccessibleHubModules(principal)
  const roleLabel =
    session?.user?.roleName ||
    USER_LEVEL_LABEL[normalizeUserLevel(session?.user?.level ?? "user")]
  const username = session?.user?.username ?? "User"

  return (
    <DashboardLayout title="Home">
      <PageActions>
        <p className="mr-auto text-sm text-muted-foreground">
          {APP_NAME} · {APP_TAGLINE}
        </p>
      </PageActions>

      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Hello, {username}
          </h2>
          <p className="text-sm text-muted-foreground">
            Role: {roleLabel}. Choose a module to continue.
          </p>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No modules available. Contact your system administrator.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={mod.href}
                className="group flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <mod.icon className="size-5" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="font-semibold tracking-tight">{mod.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {mod.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}

        {session?.user?.capabilities?.platform ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/platform/users">Manage users</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
