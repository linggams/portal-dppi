"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ClipboardList,
  FileCheck,
  BarChart3,
  Tag,
  ChevronRight,
  Inbox,
  List,
  Car,
  Boxes,
  Headset,
  Shield,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  canAccessItmsStaff,
  canAccessItmsUser,
  canAccessMobilUser,
  canAccessPlatform,
  canAccessPurchasingUser,
  canHandleMobilWorkflow,
  canManagePurchasingMaster,
  canReadItmsLibrary,
  shouldFetchPurchasingKategori,
} from "@/lib/auth/permissions"
import { EMPTY_CAPABILITIES, type AccessPrincipal } from "@/lib/auth/capabilities"

interface Kategori {
  idJenis: number
  jenisBrg: string
}

interface NavLink {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavLink[]
}

const ITEM_CLASS =
  "hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground hover:[&>svg]:!text-sidebar-primary-foreground data-[active=true]:!bg-sidebar-primary data-[active=true]:!text-sidebar-primary-foreground data-[active=true]:[&>svg]:!text-sidebar-primary-foreground data-[state=open]:hover:!bg-sidebar-primary data-[state=open]:hover:!text-sidebar-primary-foreground"

const SUB_ITEM_CLASS = `${ITEM_CLASS} h-auto items-start [&>span:last-child]:whitespace-normal [&>span:last-child]:break-words`

function splitHref(href: string) {
  const [path, query] = href.split("?")
  return { path, query: query ?? "" }
}

function isDetailOrActionSegment(segment: string) {
  // Keep parent nav active on resource detail/create routes, e.g.
  // /tickets/12, /sop/new, /laporan/baru — but not sibling sections
  // like /console/tickets matching /console.
  if (!segment) return false
  if (segment === "new" || segment === "baru" || segment === "edit") return true
  return /^\d+$/.test(segment)
}

function isActive(
  pathname: string,
  search: string,
  href: string
) {
  if (href === "#") return false
  const currentPath = pathname.split("?")[0]
  const { path: hrefPath, query: hrefQuery } = splitHref(href)

  if (hrefQuery) {
    if (currentPath !== hrefPath) return false
    const wanted = new URLSearchParams(hrefQuery)
    const actual = new URLSearchParams(search)
    return [...wanted.entries()].every(
      ([key, value]) => actual.get(key) === value
    )
  }

  if (currentPath === hrefPath) return true
  if (!currentPath.startsWith(`${hrefPath}/`)) return false

  const rest = currentPath.slice(hrefPath.length + 1)
  const first = rest.split("/")[0] ?? ""
  // Purchasing sibling list pages (…/permintaan/data)
  if (first === "data") return false
  return isDetailOrActionSegment(first)
}

function isNavTreeActive(
  pathname: string,
  search: string,
  items: NavLink[]
): boolean {
  return items.some((item) => {
    if (item.children?.length) {
      return isNavTreeActive(pathname, search, item.children)
    }
    return isActive(pathname, search, item.href)
  })
}

function getAdminPurchasingMenu(kategori: Kategori[]): NavLink[] {
  return [
    {
      title: "Stock",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/admin/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Requests",
      href: "#",
      icon: ClipboardList,
      children: [
        {
          title: "Queue",
          href: "/purchasing/admin/permintaan",
          icon: ClipboardList,
        },
        {
          title: "Data",
          href: "/purchasing/admin/permintaan/data",
          icon: FileText,
        },
      ],
    },
    {
      title: "Submissions",
      href: "#",
      icon: FileCheck,
      children: [
        {
          title: "Form",
          href: "/purchasing/admin/pengajuan",
          icon: FileCheck,
        },
        {
          title: "Data",
          href: "/purchasing/admin/pengajuan/data",
          icon: FileText,
        },
      ],
    },
    {
      title: "Categories",
      href: "/purchasing/admin/kategori",
      icon: Tag,
    },
    {
      title: "Reports",
      href: "/purchasing/admin/laporan",
      icon: BarChart3,
    },
  ]
}

function getUserPurchasingMenu(kategori: Kategori[]): NavLink[] {
  return [
    {
      title: "Stock",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/user/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Submit request",
      href: "/purchasing/user/permintaan",
      icon: ClipboardList,
    },
    {
      title: "My data",
      href: "/purchasing/user/permintaan/data",
      icon: FileText,
    },
    {
      title: "Print BPP",
      href: "/purchasing/user/cetak",
      icon: FileCheck,
    },
  ]
}

function getItmsConsoleMenu(): NavLink[] {
  return [
    {
      title: "Ticket Queue",
      href: "/itms/console/tickets",
      icon: Inbox,
    },
    {
      title: "Categories",
      href: "/itms/console/categories",
      icon: Tag,
    },
    {
      title: "SOP Register",
      href: "/itms/console/sop",
      icon: ClipboardList,
    },
    {
      title: "NIST Mapping",
      href: "/itms/console/nist",
      icon: Shield,
    },
    {
      title: "Assets",
      href: "/itms/console/assets",
      icon: Boxes,
    },
  ]
}

function getItmsPortalMenu(): NavLink[] {
  return [
    {
      title: "Home",
      href: "/itms/portal",
      icon: LayoutDashboard,
    },
    {
      title: "My Tickets",
      href: "/itms/portal/tickets",
      icon: List,
    },
    {
      title: "Create Ticket",
      href: "/itms/portal/tickets/new",
      icon: Headset,
    },
    {
      title: "SOP Register",
      href: "/itms/portal/sop",
      icon: ClipboardList,
    },
    {
      title: "NIST Mapping",
      href: "/itms/portal/nist",
      icon: Shield,
    },
    {
      title: "My Assets",
      href: "/itms/portal/assets",
      icon: Boxes,
    },
  ]
}

/** SOP + NIST only — for pemohon without full ITMS access. */
function getItmsReadOnlyMenu(): NavLink[] {
  return [
    {
      title: "SOP Register",
      href: "/itms/portal/sop",
      icon: ClipboardList,
    },
    {
      title: "NIST Mapping",
      href: "/itms/portal/nist",
      icon: Shield,
    },
  ]
}

function getAdminMobilMenu(): NavLink[] {
  return [
    {
      title: "Types",
      href: "/mobil/admin/jenis",
      icon: Tag,
    },
    {
      title: "Vehicles",
      href: "/mobil/admin/kendaraan",
      icon: Package,
    },
    {
      title: "KM reports",
      href: "/mobil/admin/laporan",
      icon: BarChart3,
    },
  ]
}

function getUserMobilMenu(): NavLink[] {
  return [
    {
      title: "Log trip",
      href: "/mobil/user/laporan",
      icon: ClipboardList,
    },
  ]
}

function NavLeaf({
  item,
  pathname,
  search,
}: {
  item: NavLink
  pathname: string
  search: string
}) {
  const Icon = item.icon
  const active = isActive(pathname, search, item.href)

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={active} className={SUB_ITEM_CLASS}>
        <Link href={item.href}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function NavNested({
  item,
  pathname,
  search,
}: {
  item: NavLink
  pathname: string
  search: string
}) {
  const Icon = item.icon
  const childActive = item.children
    ? isNavTreeActive(pathname, search, item.children)
    : false
  const [open, setOpen] = useState(childActive)

  useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  if (!item.children?.length) {
    return <NavLeaf item={item} pathname={pathname} search={search} />
  }

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/nested"
    >
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton className={`cursor-pointer ${SUB_ITEM_CLASS}`}>
            <Icon />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto mt-0.5 size-4 shrink-0 transition-transform group-data-[state=open]/nested:rotate-90" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((child) => (
              <NavLeaf
                key={child.href}
                item={child}
                pathname={pathname}
                search={search}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

function ModuleNav({
  title,
  icon: Icon,
  items,
  pathname,
  search,
  open,
  onOpenChange,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavLink[]
  pathname: string
  search: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const treeActive = isNavTreeActive(pathname, search, items)

  useEffect(() => {
    if (treeActive) onOpenChange(true)
  }, [treeActive, onOpenChange])

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={onOpenChange}
      className="group/module"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={title}
            className={`cursor-pointer ${ITEM_CLASS} h-auto min-h-8 items-start [&>span:last-child]:whitespace-normal`}
          >
            <Icon />
            <span>{title}</span>
            <ChevronRight className="ml-auto mt-0.5 size-4 shrink-0 transition-transform group-data-[state=open]/module:rotate-90 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {items.map((item) => (
              <NavNested
                key={item.title + item.href}
                item={item}
                pathname={pathname}
                search={search}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const EMPTY_PRINCIPAL: AccessPrincipal = {
  capabilities: EMPTY_CAPABILITIES,
}

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const { data: session } = useSession()
  const principal = session?.user ?? EMPTY_PRINCIPAL
  const [kategori, setKategori] = useState<Kategori[]>([])
  const [openModule, setOpenModule] = useState<string | null>(null)
  const fetchKategoriEnabled = shouldFetchPurchasingKategori(principal)

  const openPurchasing = useCallback((next: boolean) => {
    setOpenModule(next ? "Purchasing" : null)
  }, [])
  const openItms = useCallback((next: boolean) => {
    setOpenModule(next ? "IT Management" : null)
  }, [])
  const openMobil = useCallback((next: boolean) => {
    setOpenModule(next ? "Vehicle Usage" : null)
  }, [])

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const response = await fetch("/api/purchasing/jenis-barang")
        if (!response.ok) return
        const contentType = response.headers.get("content-type") ?? ""
        if (!contentType.includes("application/json")) return
        const data = await response.json()
        if (Array.isArray(data)) setKategori(data)
      } catch (error) {
        console.error("Error fetching kategori:", error)
      }
    }

    if (fetchKategoriEnabled) {
      fetchKategori()
    }
  }, [fetchKategoriEnabled])

  const purchasingItems = useMemo(() => {
    if (canManagePurchasingMaster(principal)) {
      return getAdminPurchasingMenu(kategori)
    }
    if (canAccessPurchasingUser(principal)) {
      return getUserPurchasingMenu(kategori)
    }
    return []
  }, [principal, kategori])

  const itmsItems = useMemo(() => {
    if (canAccessItmsStaff(principal)) return getItmsConsoleMenu()
    if (canAccessItmsUser(principal)) return getItmsPortalMenu()
    if (canReadItmsLibrary(principal)) return getItmsReadOnlyMenu()
    return []
  }, [principal])

  const mobilItems = useMemo(() => {
    if (canHandleMobilWorkflow(principal)) return getAdminMobilMenu()
    if (canAccessMobilUser(principal)) return getUserMobilMenu()
    return []
  }, [principal])

  const homeHref = "/home"
  const dashboardActive =
    pathname === "/home" || isActive(pathname, search, homeHref)
  const usersActive = isActive(pathname, search, "/platform/users")

  return (
    <Sidebar
      collapsible="icon"
      className="top-14! h-[calc(100svh-3.5rem)]!"
    >
      <SidebarContent className="group-data-[collapsible=icon]:items-center [scrollbar-gutter:stable]">
        <SidebarGroup className="group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={dashboardActive}
                  tooltip="Home"
                  className={ITEM_CLASS}
                >
                  <Link href={homeHref}>
                    <LayoutDashboard />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {canAccessPlatform(principal) ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={usersActive}
                    tooltip="Users"
                    className={ITEM_CLASS}
                  >
                    <Link href="/platform/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {purchasingItems.length > 0 ||
        itmsItems.length > 0 ||
        mobilItems.length > 0 ? (
          <SidebarGroup className="group-data-[collapsible=icon]:p-2">
            <SidebarGroupLabel>Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                {purchasingItems.length > 0 ? (
                  <ModuleNav
                    title="Purchasing"
                    icon={Package}
                    items={purchasingItems}
                    pathname={pathname}
                    search={search}
                    open={openModule === "Purchasing"}
                    onOpenChange={openPurchasing}
                  />
                ) : null}

                {itmsItems.length > 0 ? (
                  <ModuleNav
                    title="IT Management"
                    icon={Headset}
                    items={itmsItems}
                    pathname={pathname}
                    search={search}
                    open={openModule === "IT Management"}
                    onOpenChange={openItms}
                  />
                ) : null}

                {mobilItems.length > 0 ? (
                  <ModuleNav
                    title="Vehicle Usage"
                    icon={Car}
                    items={mobilItems}
                    pathname={pathname}
                    search={search}
                    open={openModule === "Vehicle Usage"}
                    onOpenChange={openMobil}
                  />
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
