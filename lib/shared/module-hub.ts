import type { LucideIcon } from "lucide-react"
import { Car, Headset, LayoutDashboard, Package } from "lucide-react"
import {
  canAccessItmsStaff,
  canAccessItmsUser,
  canAccessMobilUser,
  canAccessPlatform,
  canAccessPurchasingUser,
  canHandleMobilWorkflow,
  canHandlePurchasingWorkflow,
} from "@/lib/auth/permissions"
import type { AccessPrincipal } from "@/lib/auth/capabilities"

export type HubModule = {
  id: string
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export function getAccessibleHubModules(
  principal: AccessPrincipal
): HubModule[] {
  const modules: HubModule[] = []

  if (canAccessPlatform(principal)) {
    modules.push({
      id: "platform",
      title: "Platform",
      description: "Operations dashboard and user management.",
      href: "/platform/dashboard",
      icon: LayoutDashboard,
    })
  }

  if (
    canHandlePurchasingWorkflow(principal) ||
    canAccessPurchasingUser(principal)
  ) {
    modules.push({
      id: "purchasing",
      title: "Purchasing",
      description: "Stock, requests, submissions, and goods reports.",
      href: canHandlePurchasingWorkflow(principal)
        ? "/purchasing/admin/stok"
        : "/purchasing/user/dashboard",
      icon: Package,
    })
  }

  if (canAccessItmsStaff(principal) || canAccessItmsUser(principal)) {
    modules.push({
      id: "itms",
      title: "IT Management",
      description: "Tickets, SLA, SOP, assets, and NIST mapping.",
      href: canAccessItmsStaff(principal)
        ? "/itms/console/tickets"
        : "/itms/portal",
      icon: Headset,
    })
  }

  if (canHandleMobilWorkflow(principal) || canAccessMobilUser(principal)) {
    modules.push({
      id: "mobil",
      title: "Vehicle Usage",
      description: "Mileage reports, vehicles, and trip costs.",
      href: canHandleMobilWorkflow(principal)
        ? "/mobil/admin/laporan"
        : "/mobil/user/laporan",
      icon: Car,
    })
  }

  return modules
}
