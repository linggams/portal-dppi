"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  PlusCircle,
  List,
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
import { APP_NAME } from "@/lib/app-branding"
import type { AppUserLevel } from "@/lib/user-level"
import { shouldFetchPurchasingKategori } from "@/lib/auth/permissions"

interface SidebarProps {
  userLevel: AppUserLevel
}

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

function isActive(pathname: string, href: string) {
  const path = pathname.split("?")[0]
  if (href === "#") return false
  return path === href || path.startsWith(href + "/")
}

function isNavTreeActive(pathname: string, items: NavLink[]): boolean {
  return items.some((item) => {
    if (item.children?.length) {
      return isNavTreeActive(pathname, item.children)
    }
    return isActive(pathname, item.href)
  })
}

function getAdminPurchasingMenu(kategori: Kategori[]): NavLink[] {
  return [
    {
      title: "Kategori",
      href: "/purchasing/admin/kategori",
      icon: Tag,
    },
    {
      title: "Data Stok Barang",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/admin/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Permintaan Barang",
      href: "/purchasing/admin/permintaan",
      icon: ClipboardList,
    },
    {
      title: "Data Permintaan Barang",
      href: "/purchasing/admin/permintaan/data",
      icon: FileText,
    },
    {
      title: "Form Pengajuan Barang",
      href: "/purchasing/admin/pengajuan",
      icon: FileCheck,
    },
    {
      title: "Data Pengajuan Barang",
      href: "/purchasing/admin/pengajuan/data",
      icon: FileText,
    },
    {
      title: "Laporan",
      href: "/purchasing/admin/laporan",
      icon: BarChart3,
    },
  ]
}

function getPurchasingStaffMenu(): NavLink[] {
  return [
    {
      title: "Permintaan Barang",
      href: "/purchasing/admin/permintaan",
      icon: ClipboardList,
    },
    {
      title: "Data Permintaan Barang",
      href: "/purchasing/admin/permintaan/data",
      icon: FileText,
    },
    {
      title: "Form Pengajuan Barang",
      href: "/purchasing/admin/pengajuan",
      icon: FileCheck,
    },
    {
      title: "Data Pengajuan Barang",
      href: "/purchasing/admin/pengajuan/data",
      icon: FileText,
    },
  ]
}

function getUserItMenu(): NavLink[] {
  return [
    {
      title: "Antrian Tiket",
      href: "/it/user/antrian",
      icon: Inbox,
    },
    {
      title: "Ajukan Tiket Gangguan",
      href: "/it/user/tiket/buat",
      icon: PlusCircle,
    },
    {
      title: "Tiket Saya",
      href: "/it/user/tiket",
      icon: List,
    },
  ]
}

function getStaffItMenu(): NavLink[] {
  return [
    {
      title: "Dashboard IT",
      href: "/it/staff/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Antrian Tiket",
      href: "/it/staff/tiket",
      icon: Inbox,
    },
    {
      title: "Kategori Tiket",
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

function getUserPurchasingMenu(kategori: Kategori[]): NavLink[] {
  return [
    {
      title: "Data Stok Barang",
      href: "#",
      icon: Package,
      children: kategori.map((kat) => ({
        title: kat.jenisBrg,
        href: `/purchasing/user/stok?jenis=${kat.idJenis}`,
        icon: Package,
      })),
    },
    {
      title: "Form Permintaan Barang",
      href: "/purchasing/user/permintaan",
      icon: ClipboardList,
    },
    {
      title: "Data Permintaan Barang",
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

function NavSubLink({
  item,
  pathname,
  topLevel = false,
}: {
  item: NavLink
  pathname: string
  topLevel?: boolean
}) {
  const Icon = item.icon
  const active = isActive(pathname, item.href)

  if (topLevel) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
          <Link href={item.href}>
            <Icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={active}>
        <Link href={item.href}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
}

function NavSubMenu({
  item,
  pathname,
  topLevel = false,
}: {
  item: NavLink
  pathname: string
  topLevel?: boolean
}) {
  const Icon = item.icon
  const childActive = item.children
    ? isNavTreeActive(pathname, item.children)
    : false
  const defaultOpen = childActive

  if (!item.children?.length) {
    return <NavSubLink item={item} pathname={pathname} topLevel={topLevel} />
  }

  if (topLevel) {
    return (
      <Collapsible
        asChild
        defaultOpen={defaultOpen}
        className="group/nested"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
              <Icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/nested:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 border-l-0 px-0">
              {item.children.map((child) => (
                <NavSubLink key={child.href} item={child} pathname={pathname} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <Collapsible
      asChild
      defaultOpen={defaultOpen}
      className="group/nested"
    >
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton className="cursor-pointer">
            <Icon />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/nested:rotate-90" />
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 border-l-0 px-0">
            {item.children.map((child) => (
              <NavSubLink key={child.href} item={child} pathname={pathname} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

function MenuSection({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavLink[]
  pathname: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavSubMenu
              key={item.title + item.href}
              item={item}
              pathname={pathname}
              topLevel
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ userLevel }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [kategori, setKategori] = useState<Kategori[]>([])

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

    if (shouldFetchPurchasingKategori(userLevel)) {
      fetchKategori()
    }
  }, [userLevel])

  const purchasingItems = useMemo(() => {
    if (userLevel === "administrator") return getAdminPurchasingMenu(kategori)
    if (userLevel === "user") return getUserPurchasingMenu(kategori)
    if (userLevel === "purchasing") return getPurchasingStaffMenu()
    return []
  }, [userLevel, kategori])

  const itItems = useMemo(() => {
    if (userLevel === "user") return getUserItMenu()
    if (userLevel === "it_support" || userLevel === "administrator") {
      return getStaffItMenu()
    }
    return []
  }, [userLevel])

  const mainItems: NavLink[] = useMemo(() => {
    if (userLevel === "administrator") {
      return [
        { title: "Dashboard", href: "/purchasing/admin/dashboard", icon: LayoutDashboard },
        { title: "Data User", href: "/platform/users", icon: Users },
      ]
    }
    if (userLevel === "purchasing") {
      return [
        { title: "Dashboard", href: "/purchasing/admin/dashboard", icon: LayoutDashboard },
      ]
    }
    if (userLevel === "it_support") {
      return [
        { title: "Dashboard", href: "/it/staff/dashboard", icon: LayoutDashboard },
      ]
    }
    return [
      { title: "Dashboard", href: "/purchasing/user/dashboard", icon: LayoutDashboard },
    ]
  }, [userLevel])

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
      <SidebarHeader className="flex h-14 items-center justify-center border-b px-4">
        <span className="text-base font-semibold tracking-tight md:text-lg group-data-[collapsible=icon]:hidden">
          {APP_NAME}
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {purchasingItems.length > 0 ? (
          <MenuSection
            label="Purchasing"
            items={purchasingItems}
            pathname={pathname}
          />
        ) : null}

        {itItems.length > 0 ? (
          <MenuSection
            label="IT Support"
            items={itItems}
            pathname={pathname}
          />
        ) : null}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="min-w-0 text-xs group-data-[collapsible=icon]:hidden">
            <p className="truncate font-medium text-sidebar-foreground">
              {session?.user?.jabatan}
            </p>
            <p className="truncate text-muted-foreground">
              {session?.user?.username}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
            onClick={handleLogout}
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
