"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ClipboardList,
  FileCheck,
  BarChart3,
  LogOut,
  Tag,
  ChevronRight,
  Inbox,
  List,
  Wrench,
  Monitor,
  Wallet,
  Car,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { APP_NAME } from "@/lib/app-branding"
import { USER_LEVEL_LABEL, normalizeUserLevel } from "@/lib/user-level"
import {
  canAccessDanaUser,
  canAccessItStaff,
  canAccessItUser,
  canAccessMobilUser,
  canAccessPlatform,
  canAccessPurchasingUser,
  canHandleDanaWorkflow,
  canHandleMobilWorkflow,
  canManagePurchasingMaster,
  getDefaultHomePath,
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

function splitHref(href: string) {
  const [path, query] = href.split("?")
  return { path, query: query ?? "" }
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
  return !rest.startsWith("data")
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
      title: "Stok",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/admin/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Permintaan",
      href: "#",
      icon: ClipboardList,
      children: [
        {
          title: "Antrian",
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
      title: "Pengajuan",
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
      title: "Kategori",
      href: "/purchasing/admin/kategori",
      icon: Tag,
    },
    {
      title: "Laporan",
      href: "/purchasing/admin/laporan",
      icon: BarChart3,
    },
  ]
}

function getUserPurchasingMenu(kategori: Kategori[]): NavLink[] {
  return [
    {
      title: "Stok",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/user/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Ajukan",
      href: "/purchasing/user/permintaan",
      icon: ClipboardList,
    },
    {
      title: "Data Saya",
      href: "/purchasing/user/permintaan/data",
      icon: FileText,
    },
    {
      title: "Cetak BPP",
      href: "/purchasing/user/cetak",
      icon: FileCheck,
    },
  ]
}

function getStaffItMenu(): NavLink[] {
  return [
    {
      title: "Antrian",
      href: "/it/staff/tiket",
      icon: Inbox,
    },
    {
      title: "Maintenance",
      href: "/it/staff/maintenance",
      icon: Wrench,
    },
    {
      title: "Kategori",
      href: "/it/staff/kategori",
      icon: Tag,
    },
    {
      title: "Laporan",
      href: "/it/staff/laporan",
      icon: BarChart3,
    },
  ]
}

function getUserItMenu(): NavLink[] {
  return [
    {
      title: "Tiket Saya",
      href: "/it/user/tiket",
      icon: List,
    },
    {
      title: "Antrian",
      href: "/it/user/antrian",
      icon: Inbox,
    },
  ]
}

function getAdminDanaMenu(): NavLink[] {
  return [
    {
      title: "Antrian",
      href: "/dana/admin/antrian",
      icon: Inbox,
    },
    {
      title: "List Pengajuan",
      href: "/dana/admin/pengajuan",
      icon: ClipboardList,
    },
    {
      title: "Laporan",
      href: "/dana/admin/laporan",
      icon: BarChart3,
    },
  ]
}

function getUserDanaMenu(): NavLink[] {
  return [
    {
      title: "Pengajuan",
      href: "/dana/user/pengajuan",
      icon: ClipboardList,
    },
    {
      title: "Cetak",
      href: "/dana/user/cetak",
      icon: FileCheck,
    },
  ]
}

function getAdminMobilMenu(): NavLink[] {
  return [
    {
      title: "Jenis",
      href: "/mobil/admin/jenis",
      icon: Tag,
    },
    {
      title: "Kendaraan",
      href: "/mobil/admin/kendaraan",
      icon: Package,
    },
    {
      title: "Laporan KM",
      href: "/mobil/admin/laporan",
      icon: BarChart3,
    },
    {
      title: "Input Laporan",
      href: "/mobil/user/laporan",
      icon: ClipboardList,
    },
  ]
}

function getUserMobilMenu(): NavLink[] {
  return [
    {
      title: "Input Laporan",
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
      <SidebarMenuSubButton asChild isActive={active} className={ITEM_CLASS}>
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
          <SidebarMenuSubButton className={`cursor-pointer ${ITEM_CLASS}`}>
            <Icon />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/nested:rotate-90" />
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
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavLink[]
  pathname: string
  search: string
}) {
  const treeActive = isNavTreeActive(pathname, search, items)
  const [open, setOpen] = useState(treeActive)

  useEffect(() => {
    if (treeActive) setOpen(true)
  }, [treeActive])

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/module"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title} className={`cursor-pointer ${ITEM_CLASS}`}>
            <Icon />
            <span>{title}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/module:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
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
  const fetchKategoriEnabled = shouldFetchPurchasingKategori(principal)

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

  const itItems = useMemo(() => {
    if (canAccessItStaff(principal)) return getStaffItMenu()
    if (canAccessItUser(principal)) return getUserItMenu()
    return []
  }, [principal])

  const danaItems = useMemo(() => {
    if (canHandleDanaWorkflow(principal)) return getAdminDanaMenu()
    if (canAccessDanaUser(principal)) return getUserDanaMenu()
    return []
  }, [principal])

  const mobilItems = useMemo(() => {
    if (canHandleMobilWorkflow(principal)) return getAdminMobilMenu()
    if (canAccessMobilUser(principal)) return getUserMobilMenu()
    return []
  }, [principal])

  const homeHref = getDefaultHomePath(principal)
  const dashboardActive = isActive(pathname, search, homeHref)
  const usersActive = isActive(pathname, search, "/platform/users")
  const roleName =
    session?.user?.roleName ||
    USER_LEVEL_LABEL[normalizeUserLevel(session?.user?.level ?? "user")]
  const username = session?.user?.username ?? ""
  const initials = username.slice(0, 1).toUpperCase() || "U"

  const handleLogout = async () => {
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : ""

    await signOut({ redirect: false })

    if (typeof window !== "undefined") {
      window.location.href = `${currentOrigin}/login`
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex h-14 items-center px-2 group-data-[collapsible=icon]:hidden">
          <p className="truncate text-sm font-semibold leading-tight">
            {APP_NAME}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={dashboardActive}
                  tooltip="Dashboard"
                  className={ITEM_CLASS}
                >
                  <Link href={homeHref}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {canAccessPlatform(principal) ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={usersActive}
                    tooltip="Data User"
                    className={ITEM_CLASS}
                  >
                    <Link href="/platform/users">
                      <Users />
                      <span>Data User</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {purchasingItems.length > 0 ||
        itItems.length > 0 ||
        danaItems.length > 0 ||
        mobilItems.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel>Modul</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {purchasingItems.length > 0 ? (
                  <ModuleNav
                    title="Purchasing"
                    icon={Package}
                    items={purchasingItems}
                    pathname={pathname}
                    search={search}
                  />
                ) : null}

                {itItems.length > 0 ? (
                  <ModuleNav
                    title="IT Support"
                    icon={Monitor}
                    items={itItems}
                    pathname={pathname}
                    search={search}
                  />
                ) : null}

                {danaItems.length > 0 ? (
                  <ModuleNav
                    title="Pengajuan Dana"
                    icon={Wallet}
                    items={danaItems}
                    pathname={pathname}
                    search={search}
                  />
                ) : null}

                {mobilItems.length > 0 ? (
                  <ModuleNav
                    title="Penggunaan Mobil"
                    icon={Car}
                    items={mobilItems}
                    pathname={pathname}
                    search={search}
                  />
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium leading-tight">
              {username || "User"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {roleName}
            </p>
          </div>
          <button
            type="button"
            className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0 rounded-md p-2 group-data-[collapsible=icon]:hidden"
            onClick={handleLogout}
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Keluar" onClick={handleLogout}>
              <LogOut />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
